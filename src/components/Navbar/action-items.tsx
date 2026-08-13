"use client";

import { useConnectedUser } from "@breadcoop/ui";
import { CoinsIcon, HandWithdrawIcon } from "@phosphor-icons/react";
import { useModal } from "../modal/context";
import { BreadText } from "./bread-text";
import LocalButton from "../button";
import { DEPOSIT_TOKEN } from "@/lib/deposit-token";
import { useIsMiniPay } from "@/components/providers/is-minipay";
import { MINIPAY_ADD_CASH_URL } from "@/utils/minipay";

const ActionItems = () => {
  const { user } = useConnectedUser();
  const { setModal } = useModal();
  const isMiniPay = useIsMiniPay();
  const handleFund = async () => {
    // MiniPay has its own stablecoin rails — deep-link there instead of the
    // Privy funding modal (Privy is not mounted in the MiniPay stack).
    if (isMiniPay) {
      window.location.href = MINIPAY_ADD_CASH_URL;
      return;
    }

    if (user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN") {
      setModal({
        type: "FUND_WALLET",
        address: user.address,
      });
    }
  };

  return (
    <div className="-mb-3 flex flex-col gap-2">
      <LocalButton
        rightIcon={<CoinsIcon />}
        className="bg-[#DDF7D0] text-[#155D2A] hover:bg-[#DDF7D088] font-bold w-full"
        variant="positive"
        onClick={handleFund}
      >
        {isMiniPay ? "Deposit" : "Fund Stacks wallet"}
      </LocalButton>
      <BreadText
        address={
          user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
            ? user.address
            : undefined
        }
      />
      <LocalButton
        rightIcon={<HandWithdrawIcon />}
        variant="secondary"
        className="font-bold w-full mb-1"
        onClick={() => setModal({ type: "WITHDRAW_BREAD" })}
      >
        Withdraw {DEPOSIT_TOKEN.symbol}
      </LocalButton>
    </div>
  );
};

export default ActionItems;
