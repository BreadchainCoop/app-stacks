import { useEffect, useRef, useState } from "react";
import { base } from "viem/chains";
import {
  Address,
  createWalletClient,
  encodeFunctionData,
  erc20Abi,
  formatEther,
  Hex,
  http,
  parseUnits,
  zeroAddress,
} from "viem";
import { usePublicClient } from "wagmi";
import { useSendTransaction } from "@privy-io/react-auth";
import {
  apiGetPayeeDetails,
  createPeerExtensionSdk,
  Zkp2pClient,
  type BuyerTeePaymentProofInput,
  type GetQuoteSingleResponse,
  type PeerBuyerTeePaymentCapture,
  type PeerMetadataRow,
  type PreparedTransaction,
} from "@zkp2p/sdk";
import { clientEnv } from "@/lib/env";
import { breadAbi } from "@/lib/abis/bread-abi";
import { getBridgeQuote } from "@/lib/lifi";
import { useSponsoredTx } from "./use-sponsored-tx";
import { useWaitForTxReceipt } from "./use-wait-for-tx-receipt";

export const PEER_PLATFORMS = ["wise", "revolut", "venmo"] as const;

export type PeerPlatform = (typeof PEER_PLATFORMS)[number];

type PlatformConfig = {
  label: string;
  actionType: string;
  /** Only Venmo, Cash App, Revolut and Zelle send the metadata index param */
  includeMetadataIndex: boolean;
  currencies: string[];
};

export const PEER_PLATFORM_CONFIG: Record<PeerPlatform, PlatformConfig> = {
  wise: {
    label: "Wise",
    actionType: "transfer_wise",
    includeMetadataIndex: false,
    currencies: ["USD", "EUR", "GBP"],
  },
  revolut: {
    label: "Revolut",
    actionType: "transfer_revolut",
    includeMetadataIndex: true,
    currencies: ["USD", "EUR", "GBP"],
  },
  venmo: {
    label: "Venmo",
    actionType: "transfer_venmo",
    includeMetadataIndex: true,
    currencies: ["USD"],
  },
};

const ATTESTATION_SERVICE_URL = "https://attestation-service.zkp2p.xyz";
const PEER_API_BASE_URL = "https://api.zkp2p.xyz";
const MIN_EXTENSION_VERSION = [0, 6, 3] as const;
const BRIDGE_TIMEOUT_MS = 15 * 60 * 1000;
// Peer's quote API only supports Base as a destination, so the onramp lands
// USDC on Base and we bridge it to Gnosis xDAI ourselves via LI.FI.
const BASE_USDC_ADDRESS: Address = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export type PeerOnrampQuote = {
  platform: PeerPlatform;
  currency: string;
  /** Fiat amount the user must send, e.g. "10.00" */
  fiatAmount: string;
  fiatAmountFormatted: string;
  tokenAmountFormatted: string;
  /** Maker's payment handle on the platform (email/username) */
  payeeHandle: string;
};

export type PeerOnrampStep =
  | { step: "form"; error?: string }
  | { step: "quoting" }
  | { step: "signaling"; quote: PeerOnrampQuote }
  | { step: "awaiting_payment"; quote: PeerOnrampQuote }
  | { step: "capturing"; quote: PeerOnrampQuote }
  | { step: "fulfilling"; quote: PeerOnrampQuote }
  | { step: "bridging"; quote: PeerOnrampQuote }
  | { step: "minting"; quote: PeerOnrampQuote }
  | { step: "done"; quote: PeerOnrampQuote; breadAmount: string };

export type PeerOnrampResult = {
  prevBalance: bigint;
  newBalance: bigint;
  breadAmount: string;
};

type OnrampSession = {
  client: Zkp2pClient;
  platform: PeerPlatform;
  currency: string;
  fiatAmount: string;
  intentHash: Hex;
  quote: PeerOnrampQuote;
};

function isExtensionVersionSupported(version: string) {
  const parts = version.split(".").map(Number);
  const [major = 0, minor = 0, patch = 0] = parts;
  const [reqMajor, reqMinor, reqPatch] = MIN_EXTENSION_VERSION;

  if (major !== reqMajor) return major > reqMajor;
  if (minor !== reqMinor) return minor > reqMinor;
  return patch >= reqPatch;
}

function isBuyerTeeParams(
  value: unknown
): value is Record<string, string | number | boolean> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (entry) =>
        typeof entry === "string" ||
        typeof entry === "number" ||
        typeof entry === "boolean"
    )
  );
}

function selectPaymentRow(
  rows: PeerMetadataRow[],
  expected: { amount: string; currency: string }
): PeerMetadataRow | null {
  const expectedAmount = Math.abs(parseFloat(expected.amount));
  const expectedCurrency = expected.currency.toUpperCase();

  const visibleRows = rows.filter(
    (row) => !row.hidden && isBuyerTeeParams(row.params)
  );

  return (
    visibleRows.find((row) => {
      const rowAmount = row.amount ? Math.abs(parseFloat(row.amount)) : NaN;
      const rowCurrency = row.currency?.toUpperCase();

      return (
        rowAmount === expectedAmount &&
        (!rowCurrency || rowCurrency === expectedCurrency)
      );
    }) ?? null
  );
}

function buildBuyerTeeProof(
  row: PeerMetadataRow,
  capture: PeerBuyerTeePaymentCapture | null | undefined,
  config: PlatformConfig,
  platform: PeerPlatform
): BuyerTeePaymentProofInput {
  if (!capture?.encryptedSessionMaterial || !isBuyerTeeParams(row.params)) {
    throw new Error("Selected payment row is missing Buyer TEE capture data");
  }

  if (config.includeMetadataIndex && !Number.isInteger(row.originalIndex)) {
    throw new Error(
      "Selected payment row is missing its provider metadata index"
    );
  }

  return {
    proofType: "buyerTee",
    encryptedSessionMaterial: capture.encryptedSessionMaterial,
    params: {
      ...row.params,
      ...(config.includeMetadataIndex ? { index: row.originalIndex } : {}),
    },
    actionPlatform: platform,
    actionType: config.actionType,
  };
}

/**
 * Drives the headless Peer (ZKP2P) onramp end to end: quote -> signal intent
 * (sponsored, on Base) -> user pays fiat -> extension Buyer TEE capture ->
 * fulfill intent (sponsored, on Base) -> wait for the bridged xDAI to land on
 * Gnosis -> sponsored BREAD mint from the received amount.
 */
export function usePeerOnramp(
  address: Address,
  onCompleted?: (result: PeerOnrampResult) => void | Promise<void>
) {
  const [stepState, setStepState] = useState<PeerOnrampStep>({ step: "form" });
  const basePublicClient = usePublicClient({ chainId: base.id });
  const gnosisPublicClient = usePublicClient({
    chainId: clientEnv.NEXT_PUBLIC_CHAIN_ID,
  });
  const { sendTransaction } = useSendTransaction();
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { waitForTxReceipt } = useWaitForTxReceipt();

  const peerSdkRef = useRef<ReturnType<typeof createPeerExtensionSdk> | null>(
    null
  );
  const sessionRef = useRef<OnrampSession | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    peerSdkRef.current = createPeerExtensionSdk({ window });

    return () => {
      cancelledRef.current = true;
      unsubscribeRef.current?.();
    };
  }, []);

  const fail = (error: unknown, fallback: string) => {
    console.error("[usePeerOnramp]:", error);
    setStepState({
      step: "form",
      error: error instanceof Error ? error.message : fallback,
    });
  };

  const sendPreparedTx = async (prepared: PreparedTransaction) => {
    const { hash } = await sendTransaction(
      {
        to: prepared.to,
        data: prepared.data,
        value: prepared.value,
        chainId: prepared.chainId,
      },
      { sponsor: true, uiOptions: { showWalletUIs: false } }
    );

    if (!basePublicClient) throw new Error("Base RPC client unavailable");
    await basePublicClient.waitForTransactionReceipt({ hash: hash as Hex });

    return hash as Hex;
  };

  const ensurePeerReady = async () => {
    const sdk = peerSdkRef.current;
    if (!sdk) throw new Error("Peer SDK is not ready");

    const state = await sdk.getState();

    if (state === "needs_install") {
      throw new Error("The Peer browser extension is required");
    }

    if (state === "needs_connection") {
      const approved = await sdk.requestConnection();
      if (!approved) throw new Error("Peer extension connection was declined");
    }

    const version = await sdk.getVersion();
    if (!isExtensionVersionSupported(version)) {
      throw new Error(
        `Peer extension ${MIN_EXTENSION_VERSION.join(".")} or newer is required (found ${version})`
      );
    }

    return sdk;
  };

  const readUsdcBalance = async () => {
    if (!basePublicClient) throw new Error("Base RPC client unavailable");

    return basePublicClient.readContract({
      address: BASE_USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    });
  };

  // The fulfill tx releases USDC to the recipient on Base in the same block;
  // the short retry loop only covers RPC lag.
  const waitForUsdcReceived = async (prevBalance: bigint) => {
    for (let attempt = 0; attempt < 15; attempt++) {
      if (cancelledRef.current) throw new Error("Onramp was cancelled");

      const balance = await readUsdcBalance();
      if (balance > prevBalance) return balance - prevBalance;

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error(
      "Your payment was verified, but the USDC has not shown up on Base yet - check back in a few minutes."
    );
  };

  const bridgeUsdcToXdai = async (amount: bigint) => {
    if (!basePublicClient) throw new Error("Base RPC client unavailable");

    const lifiQuote = await getBridgeQuote({
      fromChainId: base.id,
      toChainId: clientEnv.NEXT_PUBLIC_CHAIN_ID,
      fromToken: BASE_USDC_ADDRESS,
      toToken: zeroAddress,
      fromAmount: amount,
      fromAddress: address,
      toAddress: address,
    });

    const txRequest = lifiQuote.transactionRequest;
    const approvalAddress = lifiQuote.estimate.approvalAddress as
      | Address
      | undefined;

    if (!txRequest?.to || !txRequest.data) {
      throw new Error("LI.FI returned no executable bridge transaction");
    }

    if (approvalAddress) {
      const allowance = await basePublicClient.readContract({
        address: BASE_USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address, approvalAddress],
      });

      if (allowance < amount) {
        await sendPreparedTx({
          to: BASE_USDC_ADDRESS,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [approvalAddress, amount],
          }),
          value: BigInt(0),
          chainId: base.id,
        });
      }
    }

    await sendPreparedTx({
      to: txRequest.to as Address,
      data: txRequest.data as Hex,
      value: txRequest.value ? BigInt(txRequest.value) : BigInt(0),
      chainId: base.id,
    });
  };

  const waitForBridgedXdai = async (prevBalance: bigint) => {
    if (!gnosisPublicClient) throw new Error("Gnosis RPC client unavailable");

    const timeoutAt = Date.now() + BRIDGE_TIMEOUT_MS;

    while (Date.now() < timeoutAt) {
      if (cancelledRef.current) throw new Error("Onramp was cancelled");

      const balance = await gnosisPublicClient.getBalance({ address });
      if (balance > prevBalance) return balance;

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    throw new Error(
      "Your payment was verified, but the bridged funds have not arrived yet. They are still on the way - check your balance in a few minutes."
    );
  };

  const mintBread = async (value: bigint) => {
    const { hash } = await sendSponsoredTransaction(
      {
        to: clientEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS,
        data: encodeFunctionData({
          abi: breadAbi,
          functionName: "mint",
          args: [address],
        }),
        value,
      },
      { uiOptions: { showWalletUIs: false } }
    );

    await waitForTxReceipt(hash);
  };

  const findIntentHash = async (client: Zkp2pClient, depositId: string) => {
    // The signal tx only returns its own hash; recover the intent hash from
    // the on-chain view once the receipt has landed.
    for (let attempt = 0; attempt < 10; attempt++) {
      const intents = await client.getAccountIntents(address);
      const match = intents
        .filter((view) => view.intent.depositId.toString() === depositId)
        .sort((a, b) => Number(b.intent.timestamp - a.intent.timestamp))[0];

      if (match) return match.intentHash as Hex;

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error("Could not locate the signaled intent on-chain");
  };

  const startOnramp = async ({
    platform,
    currency,
    fiatAmount,
  }: {
    platform: PeerPlatform;
    currency: string;
    fiatAmount: string;
  }) => {
    try {
      setStepState({ step: "quoting" });

      await ensurePeerReady();

      const client = new Zkp2pClient({
        walletClient: createWalletClient({
          account: address,
          chain: base,
          transport: http(),
        }),
        chainId: base.id,
      });

      const quoteResponse = await client.getQuote({
        paymentPlatforms: [platform],
        fiatCurrency: currency,
        user: address,
        recipient: address,
        destinationChainId: base.id,
        destinationToken: BASE_USDC_ADDRESS,
        // The quote API takes fiat amounts in 6-decimal precise units
        // ("200000000" = 200.00), not human-readable strings.
        amount: parseUnits(fiatAmount, 6).toString(),
        isExactFiat: true,
      });

      const bestQuote: GetQuoteSingleResponse | undefined =
        quoteResponse.responseObject.quotes[0];

      if (!bestQuote) {
        throw new Error(
          `No ${PEER_PLATFORM_CONFIG[platform].label} liquidity available for this amount right now`
        );
      }

      const intent = bestQuote.intent;

      // Quote responses only inline payeeData for authenticated callers, but
      // the payee lookup itself is public - fetch the maker's handle so the
      // payment instructions can show where to send the fiat.
      let payeeHandle = bestQuote.payeeData?.offchainId ?? "";
      if (!payeeHandle) {
        try {
          const payee = await apiGetPayeeDetails(
            {
              hashedOnchainId: intent.payeeDetails,
              processorName: intent.processorName,
            },
            PEER_API_BASE_URL
          );
          payeeHandle = payee.responseObject?.offchainId ?? "";
        } catch (error) {
          console.warn("[usePeerOnramp]: payee details lookup failed", error);
        }
      }

      const quote: PeerOnrampQuote = {
        platform,
        currency,
        // Keep the human-readable amount (the API echoes precise units);
        // it is matched against the captured payment rows later.
        fiatAmount,
        fiatAmountFormatted: bestQuote.fiatAmountFormatted,
        tokenAmountFormatted: bestQuote.tokenAmountFormatted,
        payeeHandle,
      };

      setStepState({ step: "signaling", quote });

      const prepared = await client.signalIntent.prepare({
        depositId: String(intent.depositId),
        amount: intent.amount,
        toAddress: intent.toAddress as Address,
        processorName: intent.processorName,
        payeeDetails: intent.payeeDetails,
        fiatCurrencyCode: intent.fiatCurrencyCode,
        conversionRate: bestQuote.conversionRate,
        escrowAddress: intent.escrowAddress as Address,
      });

      await sendPreparedTx(prepared);

      const intentHash = await findIntentHash(client, String(intent.depositId));

      sessionRef.current = {
        client,
        platform,
        currency,
        fiatAmount: quote.fiatAmount,
        intentHash,
        quote,
      };

      setStepState({ step: "awaiting_payment", quote });
    } catch (error) {
      fail(error, "Could not start the Peer onramp");
    }
  };

  const confirmPaid = async () => {
    const session = sessionRef.current;
    if (!session) return;

    try {
      const sdk = await ensurePeerReady();
      const config = PEER_PLATFORM_CONFIG[session.platform];

      setStepState({ step: "capturing", quote: session.quote });

      // Register before authenticate() per SDK requirements.
      unsubscribeRef.current?.();
      unsubscribeRef.current = sdk.onMetadataMessage(async (message) => {
        try {
          if (message.errorMessage) throw new Error(message.errorMessage);

          const row = selectPaymentRow(message.metadata, {
            amount: session.fiatAmount,
            currency: session.currency,
          });

          if (!row) {
            throw new Error(
              "None of your recent payments matched the expected amount"
            );
          }

          const proof = buildBuyerTeeProof(
            row,
            message.buyerTeeCapture,
            config,
            session.platform
          );

          setStepState({ step: "fulfilling", quote: session.quote });

          // Snapshot both sides before fulfilling: USDC lands on Base with
          // the fulfill tx, xDAI lands on Gnosis after our LI.FI bridge.
          if (!gnosisPublicClient)
            throw new Error("Gnosis RPC client unavailable");
          const prevUsdcBalance = await readUsdcBalance();
          const prevBalance = await gnosisPublicClient.getBalance({ address });

          const prepared = await session.client.fulfillIntent.prepare({
            intentHash: session.intentHash,
            proof,
            attestationServiceUrl: ATTESTATION_SERVICE_URL,
          });

          await sendPreparedTx(prepared);

          setStepState({ step: "bridging", quote: session.quote });
          const usdcReceived = await waitForUsdcReceived(prevUsdcBalance);
          await bridgeUsdcToXdai(usdcReceived);
          const newBalance = await waitForBridgedXdai(prevBalance);

          setStepState({ step: "minting", quote: session.quote });
          await mintBread(newBalance - prevBalance);

          const breadAmount = formatEther(newBalance - prevBalance);
          setStepState({ step: "done", quote: session.quote, breadAmount });

          await onCompleted?.({ prevBalance, newBalance, breadAmount });
        } catch (error) {
          fail(error, "Could not verify your payment");
        } finally {
          unsubscribeRef.current?.();
          unsubscribeRef.current = null;
        }
      });

      sdk.authenticate({
        actionType: config.actionType,
        attestationActionType: config.actionType,
        attestationServiceUrl: ATTESTATION_SERVICE_URL,
        captureMode: "buyerTee",
        platform: session.platform,
      });
    } catch (error) {
      fail(error, "Could not start the payment capture");
    }
  };

  const reset = () => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    sessionRef.current = null;
    setStepState({ step: "form" });
  };

  return { stepState, startOnramp, confirmPaid, reset };
}
