import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import {
  useActiveChainId,
  useChainConfig,
} from "@/components/providers/active-chain";
import { useReadContract } from "wagmi";

export const useCirclePreview = (circleId: string) => {
  // A hand-edited/corrupted invite link can hand us a non-numeric circleId —
  // BigInt() throws synchronously, so guard it rather than crash the page.
  let parsedId: bigint | undefined;
  try {
    parsedId = circleId ? BigInt(circleId) : undefined;
  } catch {
    parsedId = undefined;
  }

  return useReadContract({
    abi: savingCirclesAbi,
    address: useChainConfig().savingCircles,
    functionName: "getCircle",
    args: [parsedId ?? BigInt(0)],
    chainId: useActiveChainId(),
    query: { enabled: parsedId !== undefined },
  });
};
