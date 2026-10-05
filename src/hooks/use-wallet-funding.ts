import { useModal } from "@/components/modal/context";
import { useConnectedUser } from "@breadcoop/ui";
import { DepositTokenConfig } from "@/interfaces/chain-config";
import {
  useActiveChainId,
  useDepositToken,
} from "@/components/providers/active-chain";
import { useFundWallet as useFundPrivyWallet } from "@privy-io/react-auth";

const fundingTokens = (depositToken: DepositTokenConfig) => ({
  xdai: {
    erc20: undefined,
    receiveFundsTitle: "xDAI",
  },
  bread: {
    erc20: depositToken.address,
    receiveFundsTitle: depositToken.symbol,
  },
});

export const useFundWallet = () => {
  const { setModal } = useModal();
  const { fundWallet: fundPrivyWallet } = useFundPrivyWallet();
  const connectedUser = useConnectedUser();
  const chainId = useActiveChainId();
  const tokens = fundingTokens(useDepositToken());

  const fundWallet = async (token?: "bread" | "xdai") => {
    if (!token) token = "bread";
    console.log("[fundWallet]: user status", connectedUser);
    if (connectedUser.user.status !== "CONNECTED") return;

    console.log("[useFundWallet -> fundWallet]: awaiting privyWallet");

    const response = await fundPrivyWallet({
      address: connectedUser.user.address,
      options: {
        chain: {
          id: chainId,
        },
        ...(token !== "xdai" && {
          asset: {
            erc20: tokens[token || "bread"].erc20,
          },
        }),
        uiConfig: {
          receiveFundsTitle: `Receive ${tokens[token || "bread"].receiveFundsTitle}`,
        },
      },
    });

    console.log("__ FUNDING RESULT __", response);

    if (response.status === "completed") {
      setModal({ type: "WALLET_FUNDING_STATUS", status: "loading" });
    }

    return response;
  };

  return fundWallet;
};
