import { useModal } from "@/components/modal/context";
import { clientEnv } from "@/lib/env";
import { DEPOSIT_TOKEN } from "@/lib/deposit-token";
import { useConnectedUser } from "@breadcoop/ui";
import { useFundWallet as useFundPrivyWallet } from "@privy-io/react-auth";

const tokens = {
  xdai: {
    receiveFundsTitle: "xDAI",
  },
  bread: {
    erc20: DEPOSIT_TOKEN.address,
    receiveFundsTitle: "BREAD",
  },
};

export const useFundWallet = () => {
  const { setModal } = useModal();
  const { fundWallet: fundPrivyWallet } = useFundPrivyWallet();
  const connectedUser = useConnectedUser();

  const fundWallet = async (token?: "bread" | "xdai") => {
    if (!token) token = "bread";
    console.log("[fundWallet]: user status", connectedUser);
    if (connectedUser.user.status !== "CONNECTED") return;

    console.log("[useFundWallet -> fundWallet]: awaiting privyWallet");

    const response = await fundPrivyWallet({
      address: connectedUser.user.address,
      options: {
        chain: {
          id: clientEnv.NEXT_PUBLIC_CHAIN_ID,
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
