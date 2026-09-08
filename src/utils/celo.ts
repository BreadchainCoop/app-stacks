import { celo, celoSepolia } from "viem/chains";
import { Address } from "viem";
import { clientEnv } from "@/lib/env";

export const isCeloChain = (chainId: number): boolean =>
  chainId === celo.id || chainId === celoSepolia.id;

// CIP-64 fee currencies on Celo mainnet, keyed by deposit-token address.
// USDT/USDC gas is paid through a separate adapter address — using the token
// address as feeCurrency fails the transaction. USDm is 18-decimal, so the
// token doubles as its own adapter (docs.minipay.xyz).
const CELO_FEE_CURRENCIES: Record<string, Address> = {
  // USDT -> adapter
  "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e":
    "0x0e2a3e05bc9a16f5292a6170456a710cb89c6f72",
  // USDC -> adapter
  "0xceba9300f2b948710d2653dd7b07f33a8b32118c":
    "0x2f25deb3848c207fc8e0c34035b3ba7fc157602b",
  // USDm (cUSD) -> itself
  "0x765de816845861e75a25fca122bb6898b8b1282a":
    "0x765de816845861e75a25fca122bb6898b8b1282a",
};

/**
 * Fee currency to request for CIP-64 transactions on Celo. MiniPay treats it
 * as a hint (it may substitute the user's largest stablecoin balance), so
 * `undefined` — unknown token and no env override — is fine: the wallet picks.
 */
export const getFeeCurrency = (chainId: number): Address | undefined => {
  if (!isCeloChain(chainId)) return undefined;

  if (clientEnv.NEXT_PUBLIC_CELO_FEE_CURRENCY) {
    return clientEnv.NEXT_PUBLIC_CELO_FEE_CURRENCY as Address;
  }

  return CELO_FEE_CURRENCIES[
    clientEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS.toLowerCase()
  ];
};
