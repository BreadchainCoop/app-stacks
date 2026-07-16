import { useQuery } from "@tanstack/react-query";
import { Address, createPublicClient, getAddress, http, isAddress } from "viem";
import { mainnet } from "viem/chains";
import { normalize, toCoinType } from "viem/ens";
import { getDefaultChainId } from "@/utils/chain";
import { networks } from "@/utils/network";

// ENS names are resolved on Ethereum mainnet (ENS's home chain). Two hazards
// this guards against (see the addMembers risk review):
//  1. Smart-contract wallets (Safe, Argent…) are deployed per chain; an
//     address that is a contract on mainnet is almost certainly uncontrolled
//     on the deployment chain, so a payout pushed to it would be lost.
//  2. A name may publish a chain-specific address record (ENSIP-11) that
//     differs from its default ETH address — we prefer the deployment chain's
//     record and only fall back to the ETH address with a warning.
const mainnetClient = createPublicClient({ chain: mainnet, transport: http() });

const deploymentChain =
  networks[getDefaultChainId() as keyof typeof networks]?.chain;

const deploymentClient = deploymentChain
  ? createPublicClient({ chain: deploymentChain, transport: http() })
  : null;

export type ResolvedInvitee = {
  input: string;
  address: Address | null;
  ensName: string | null;
  /** Resolved via the deployment chain's ENSIP-11 record (vs the ETH fallback) */
  usedChainRecord: boolean;
  /** Contract on mainnet — likely uncontrolled on the deployment chain */
  isContractOnMainnet: boolean;
  /** No bytecode and no nonce on the deployment chain — looks unused there */
  isUnusedOnChain: boolean;
  error: string | null;
};

const looksLikeEnsName = (value: string) =>
  value.includes(".") && !value.startsWith("0x");

const inspectAddress = async (address: Address) => {
  const [mainnetCode, chainCode, chainNonce] = await Promise.all([
    mainnetClient.getCode({ address }).catch(() => undefined),
    deploymentClient?.getCode({ address }).catch(() => undefined),
    deploymentClient?.getTransactionCount({ address }).catch(() => undefined),
  ]);

  const isContractOnMainnet = Boolean(mainnetCode) && mainnetCode !== "0x";
  const hasChainCode = Boolean(chainCode) && chainCode !== "0x";
  const isUnusedOnChain = !hasChainCode && (chainNonce ?? 0) === 0;

  return { isContractOnMainnet, isUnusedOnChain };
};

export const useResolveInvitee = (input: string) => {
  const trimmed = input.trim();
  const isRawAddress = isAddress(trimmed);
  const isEns = looksLikeEnsName(trimmed);

  return useQuery({
    queryKey: ["resolve-invitee", getDefaultChainId(), trimmed.toLowerCase()],
    enabled: isRawAddress || (isEns && trimmed.length >= 3),
    staleTime: 60_000,
    retry: 1,
    queryFn: async (): Promise<ResolvedInvitee> => {
      if (isRawAddress) {
        const address = getAddress(trimmed);
        const { isContractOnMainnet, isUnusedOnChain } =
          await inspectAddress(address);
        return {
          input: trimmed,
          address,
          ensName: null,
          usedChainRecord: false,
          isContractOnMainnet,
          isUnusedOnChain,
          error: null,
        };
      }

      const name = normalize(trimmed);

      try {
        // Prefer the deployment chain's own address record (ENSIP-11); fall
        // back to the default ETH address if the name doesn't publish one.
        const chainCoinType = toCoinType(getDefaultChainId());
        const chainAddress = await mainnetClient
          .getEnsAddress({ name, coinType: chainCoinType })
          .catch(() => null);

        const ethAddress = chainAddress
          ? null
          : await mainnetClient.getEnsAddress({ name });

        const address = chainAddress ?? ethAddress;

        if (!address) {
          return {
            input: trimmed,
            address: null,
            ensName: trimmed,
            usedChainRecord: false,
            isContractOnMainnet: false,
            isUnusedOnChain: false,
            error: "Name not found",
          };
        }

        const { isContractOnMainnet, isUnusedOnChain } =
          await inspectAddress(address);

        return {
          input: trimmed,
          address,
          ensName: trimmed,
          usedChainRecord: Boolean(chainAddress),
          // A chain-specific record is authoritative for that chain, so don't
          // second-guess it with the mainnet-contract heuristic.
          isContractOnMainnet: chainAddress ? false : isContractOnMainnet,
          isUnusedOnChain,
          error: null,
        };
      } catch {
        return {
          input: trimmed,
          address: null,
          ensName: trimmed,
          usedChainRecord: false,
          isContractOnMainnet: false,
          isUnusedOnChain: false,
          error: "Could not resolve name",
        };
      }
    },
  });
};
