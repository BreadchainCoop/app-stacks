import { activeChain, activeChainId } from "@/lib/network";

export const getDefaultChainId = () => activeChainId;

export const getDefaultChainDetail = () => activeChain;
