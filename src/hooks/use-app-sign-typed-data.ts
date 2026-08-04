import { IS_E2E_WALLET } from "@/lib/e2e";
import { useSignTypedData as usePrivySignTypedData } from "@privy-io/react-auth";
import { useSignTypedData as useWagmiSignTypedData } from "wagmi";

/**
 * Typed-data signing for invite links. Privy's embedded wallet normally, the
 * injected wallet via wagmi under the local E2E wallet mode (see
 * src/lib/e2e.ts). The signature matches Privy's `signTypedData` so callers
 * are identical either way.
 */
export const useAppSignTypedData = () => {
  const { signTypedData } = usePrivySignTypedData();
  const { signTypedDataAsync } = useWagmiSignTypedData();

  const appSignTypedData: typeof signTypedData = async (input, options) => {
    if (IS_E2E_WALLET) {
      const signature = await signTypedDataAsync(
        input as Parameters<typeof signTypedDataAsync>[0]
      );

      return { signature };
    }

    return signTypedData(input, options);
  };

  return { signTypedData: appSignTypedData };
};
