"use client";

import { HandWithdrawIcon } from "@phosphor-icons/react";
import { useModal } from "../modal/context";
import LocalButton from "../button";

const ActionItems = () => {
  const { setModal } = useModal();

  return (
    <div className="-mb-3 flex flex-col gap-2">
      <LocalButton
        rightIcon={<HandWithdrawIcon />}
        variant="secondary"
        className="font-bold w-full mb-1"
        onClick={() => setModal({ type: "WITHDRAW_BREAD" })}
      >
        Withdraw BREAD
      </LocalButton>
    </div>
  );
};

export default ActionItems;
