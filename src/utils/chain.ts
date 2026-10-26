import { foundryChain } from "@/lib/wagmi";
import { celo, celoSepolia, gnosis, polygon, sepolia } from "viem/chains";
import { isNimiqPayChain } from "./nimiq-pay";

export const networks = {
  11155111: {
    explorerUrl: "https://sepolia.etherscan.io/address",
    chain: sepolia,
  },
  31337: {
    explorerUrl: "https://gnosisscan.io/address",
    chain: foundryChain,
  },
  100: {
    explorerUrl: "https://gnosisscan.io/address",
    chain: gnosis,
  },
  42220: {
    explorerUrl: "https://celoscan.io/address",
    chain: celo,
  },
  11142220: {
    explorerUrl: "https://celo-sepolia.blockscout.com/address",
    chain: celoSepolia,
  },
  137: {
    explorerUrl: "https://polygonscan.com/address",
    chain: polygon,
  },
};

export const getNetwork = (chainId: number) =>
  networks[chainId as keyof typeof networks];

export const getChainDetail = (chainId: number) => getNetwork(chainId).chain;

// Chains whose deposit token is a plain stablecoin (USDT on Celo and Polygon),
// funded by sending it. The others hold BREAD, baked from xDAI. Celo is checked
// here rather than through isCeloChain: ./celo loads the client env, which the
// route handlers that import this module can't.
export const isStablecoinChain = (chainId: number): boolean =>
  chainId === celo.id || chainId === celoSepolia.id || isNimiqPayChain(chainId);

// Nimiq Pay pays gas in the chain's native token, with no sponsorship, so a
// wallet holding only USDT on Polygon can't send anything. Celo needs no note
// (MiniPay pays gas in the stablecoin), and the BREAD chains' funding copy
// already asks for xDAI.
export const networkFeeNote = (chainId: number): string | null => {
  if (!isNimiqPayChain(chainId)) return null;

  const { name, nativeCurrency } = getChainDetail(chainId);

  return `You also need a little ${nativeCurrency.symbol} on ${name} to pay network fees.`;
};
