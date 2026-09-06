import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
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
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    functionName: "getCircle",
    args: [parsedId ?? BigInt(0)],
    chainId: getDefaultChainId(),
    query: { enabled: parsedId !== undefined },
  });
};
