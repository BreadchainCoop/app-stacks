import { useEffect, useState } from "react";
import { usePrivy, WalletWithMetadata } from "@privy-io/react-auth";
import { Address, formatEther } from "viem";
import FundButton, { FundButtonProps } from "./fund-button";
import { Body } from "@breadcoop/ui";
import { formatAmount } from "@/utils/format-amount";
import { usePublicClient } from "wagmi";
import { clientEnv } from "@/lib/env";
import { useModal } from "../../context";

const walletIconMap = {
  binance: "/public/binance.svg",
  rabby: "/rabby.svg",
  coinbase: "/coinbase.svg",
  metamask: "/metamask.svg",
};

const _walletInfos: FundButtonProps["infos"] = [{ label: "Instant" }];

const FundWithConnectedWalletContent = ({
  wallet,
  walletAddress,
}: {
  wallet?: string;
  walletAddress?: Address;
}) => {
  const publicClient = usePublicClient({
    chainId: clientEnv.NEXT_PUBLIC_CHAIN_ID,
  });
  const { setModal } = useModal();
  const [xDaiBalance, setXDaiBalance] = useState<string | null>(null);

  const walletInfos: FundButtonProps["infos"] = [..._walletInfos];

  useEffect(() => {
    if (!walletAddress || !publicClient) return;

    const fetchBalance = async () => {
      try {
        const balance = await publicClient.getBalance({
          address: walletAddress,
        });
        setXDaiBalance(formatAmount(parseFloat(formatEther(balance))));
      } catch {
        void 0;
      }
    };

    fetchBalance();
  }, [walletAddress, publicClient]);

  if (wallet) {
    walletInfos.unshift({
      label: xDaiBalance ? `$${xDaiBalance} xDai` : "Loading...",
    });
  }

  const handleFundWallet = async () => {
    setModal({ type: "FUND_WITH_CONNECTED_WALLET_MODAL_AMOUNT", wallet });
  };

  return (
    <FundButton
      imgSrc={
        wallet
          ? walletIconMap[wallet as keyof typeof walletIconMap]
          : "/general-wallet.svg"
      }
      title={`Wallet ${walletAddress ? `(...${walletAddress?.slice(-4)})` : ""}`.trim()}
      infos={walletInfos}
      onClick={handleFundWallet}
    />
  );
};

const FundWithConnectedWallet = ({
  handleListerForXDai: _handleListerForXDai,
}: {
  handleListerForXDai: (v: boolean) => void;
}) => {
  const [walletExtension, setWalletExtension] = useState<
    "loading" | "installed" | "uninstalled"
  >("loading");
  const { user } = usePrivy();
  const walletClient = user?.linkedAccounts.find(
    (a) => a.type === "wallet" && a.connectorType === "injected"
  ) as WalletWithMetadata | undefined;

  useEffect(() => {
    if (window.ethereum) {
      setWalletExtension("installed");
    } else {
      setWalletExtension("uninstalled");
    }
  }, []);

  if (!walletClient && walletExtension !== "installed") return null;

  return (
    <>
      <FundWithConnectedWalletContent
        wallet={walletClient?.walletClientType}
        walletAddress={walletClient?.address as undefined | Address}
      />
      <div className="flex items-center justify-center my-6">
        <div className="w-full h-px bg-blue-0" />
        <Body className="mx-4 text-surface-grey text-xs">More</Body>
        <div className="w-full h-px bg-blue-0" />
      </div>
    </>
  );
};

export default FundWithConnectedWallet;
