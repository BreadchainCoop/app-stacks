import { useAutoBakeBread } from "./use-auto-bake-bread";
import { isCeloChain } from "@/utils/celo";
import { getDefaultChainId } from "@/utils/chain";
import { Address } from "viem";

type RefetchResult = {
  data?: {
    value?: bigint;
  };
};

const ZERO = BigInt(0);

export const usePostNativeFundingBake = () => {
  const { autoBakeBread } = useAutoBakeBread();

  const handlePostNativeFundingBake = async ({
    receiver,
    refetchEmbeddedNativeBalance,
    refetchEmbeddedBreadBalance,
  }: {
    receiver: Address;
    refetchEmbeddedNativeBalance: () => Promise<RefetchResult>;
    refetchEmbeddedBreadBalance: () => Promise<RefetchResult>;
  }) => {
    if (isCeloChain(getDefaultChainId())) {
      return {
        embeddedBreadAfterFunding: ZERO,
        embeddedNativeAfterFunding: ZERO,
        baked: false,
      };
    }

    const [embeddedBreadRefetch, embeddedNativeRefetch] = await Promise.all([
      refetchEmbeddedBreadBalance(),
      refetchEmbeddedNativeBalance(),
    ]);

    const embeddedBreadAfterFunding = embeddedBreadRefetch.data?.value ?? ZERO;
    const embeddedNativeAfterFunding =
      embeddedNativeRefetch.data?.value ?? ZERO;

    if (embeddedNativeAfterFunding <= ZERO) {
      return {
        embeddedBreadAfterFunding,
        embeddedNativeAfterFunding,
        baked: false,
      };
    }

    await autoBakeBread({
      receiver,
      amount: embeddedNativeAfterFunding,
    });

    await Promise.all([
      refetchEmbeddedBreadBalance(),
      refetchEmbeddedNativeBalance(),
    ]);

    return {
      embeddedBreadAfterFunding,
      embeddedNativeAfterFunding,
      baked: true,
    };
  };

  return { handlePostNativeFundingBake };
};
