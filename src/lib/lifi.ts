import { createConfig, getQuote, type LiFiStep } from "@lifi/sdk";

export const LIFI_INTEGRATOR = "Stacks";

let configured = false;

function ensureLifiConfig() {
  if (configured) return;

  createConfig({ integrator: LIFI_INTEGRATOR });
  configured = true;
}

export type BridgeQuoteParams = {
  fromChainId: number;
  toChainId: number;
  fromToken: string;
  toToken: string;
  fromAmount: bigint;
  fromAddress: string;
  toAddress?: string;
};

/**
 * Fetches an executable LI.FI quote (single step, includes
 * `transactionRequest` and `estimate.approvalAddress`) for bridging/swapping
 * without the widget UI. The caller signs and submits the transaction itself.
 */
export async function getBridgeQuote({
  fromChainId,
  toChainId,
  fromToken,
  toToken,
  fromAmount,
  fromAddress,
  toAddress,
}: BridgeQuoteParams): Promise<LiFiStep> {
  ensureLifiConfig();

  return getQuote({
    fromChain: fromChainId,
    toChain: toChainId,
    fromToken,
    toToken,
    fromAmount: fromAmount.toString(),
    fromAddress,
    toAddress,
  });
}
