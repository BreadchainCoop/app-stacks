"use client";

import { ReactNode, useState } from "react";
import { ModalContainer, ModalHeader, ModalStatus } from "../components";
import { Label } from "@/components/label";
import Input from "@/components/input";
import NumericInput from "@/components/numeric-input";
import {
  Body,
  formatBalance,
  FormattedDecimalNumber,
  LiftedButton,
  Logo,
  TUserConnected,
  useConnectedUser,
} from "@breadcoop/ui";
import { useAccount, useReadContract } from "wagmi";
import { Address, encodeFunctionData, erc20Abi, isAddress } from "viem";
import LocalLiftedButton from "@/components/lifted-button";
import Loading from "@/app/loading";
import { cn } from "@/lib/utils";
import { BREAD_TOKEN_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { CircularProgressIcon } from "@/components/icons/circular-progress";
import { ArrowDownIcon } from "@phosphor-icons/react";
import { useModal } from "../context";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";

const BREAD_DECIMALS = 18;

function SuccessContent({
  amount,
  recipient,
}: {
  amount: string;
  recipient: string;
}) {
  const { setModal } = useModal();
  return (
    <div className="flex flex-col items-center gap-2">
      <ModalStatus status="success" statusMsg="Withdrawal Complete" />
      <Body
        bold
        className="flex items-center justify-center border border-paper-2 p-1 gap-2 mt-4"
      >
        <Logo size={24} variant="square" />{" "}
        <FormattedDecimalNumber
          value={amount}
          integralPartClassName="text-base"
          decimalPartClassName="text-xs"
        />{" "}
        <span>BREAD</span>
      </Body>
      <div>
        <ArrowDownIcon size={24} className="fill-primary-blue" />
      </div>
      <Body className="border border-paper-2 py-3 px-4 bg-paper-1 mb-4">
        {recipient}
      </Body>
      <div className="w-full">
        <LiftedButton
          onClick={() => setModal(null)}
          className="bg-surface-grey text-paper-main font-bold cursor-default!"
          disabled
          width="full"
        >
          Close
        </LiftedButton>
      </div>
    </div>
  );
}

const WithdrawBreadModal = () => {
  const [level, setLevel] = useState<"form" | "loading" | "error" | "success">(
    "form"
  );
  const { address: recipientAddress, isConnected } = useAccount();
  const { user } = useConnectedUser();
  const connectedAddress = (user as TUserConnected).address;

  const [form, setForm] = useState({
    address: "",
    amount: "",
  });

  const { data, isLoading, error } = useReadContract({
    address: BREAD_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [connectedAddress],
    chainId: getDefaultChainId(),
    query: {
      enabled: isConnected && Boolean(connectedAddress),
    },
  });

  const { sendSponsoredTransaction } = useSponsoredTx();

  const balance = data
    ? formatBalance(Number(data) / 10 ** BREAD_DECIMALS, 2)
    : 0;
  console.log("Balance data", { data, isLoading, error, balance });

  const setRecipientAddress = () => {
    console.log("Setting connected address", recipientAddress);
    if (isConnected && recipientAddress) {
      setForm((prev) => ({ ...prev, address: recipientAddress }));
    }
  };

  const setMaxAmount = () => {
    if (!balance) return;

    setForm((prev) => ({ ...prev, amount: balance.toString() }));
  };

  let buttonWithdrawContent: ReactNode = "Withdraw";

  if (level === "loading") {
    buttonWithdrawContent = <Loading />;
  } else if (form.address === "") {
    buttonWithdrawContent = "Enter Recipient Adress";
  } else if (!isAddress(form.address)) {
    buttonWithdrawContent = "Invalid Address";
  } else if (form.amount === "" || Number(form.amount) <= 0) {
    buttonWithdrawContent = "Enter Amount";
  } else if (Number(form.amount) > Number(balance)) {
    buttonWithdrawContent = "Insufficient Balance";
  }

  const disableButton =
    typeof buttonWithdrawContent === "string" &&
    buttonWithdrawContent !== "Withdraw";

  const withdraw = async () => {
    if (disableButton) return;

    setLevel("loading");

    const recipientAddress = form.address as Address;
    const amountToSend = Number(form.amount);

    const encodedData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [recipientAddress, BigInt(amountToSend * 10 ** BREAD_DECIMALS)],
    });

    try {
      const { hash } = await sendSponsoredTransaction({
        to: BREAD_TOKEN_ADDRESS,
        data: encodedData,
        chainId: getDefaultChainId(),
      });
      console.log("Transaction sent", { hash });
      setLevel("success");
    } catch (error) {
      console.error("Withdraw error", error);
      setLevel("error");
    }
  };

  return (
    <ModalContainer className="max-w-142!">
      <ModalHeader title="Withdraw" />
      {level === "success" ? (
        <SuccessContent amount={form.amount} recipient={recipientAddress!} />
      ) : level === "error" ? (
        <>
          <ModalStatus status="error" statusMsg="Withdrawal Failed" />
          <Body className="text-center">
            Something went wrong during the withdrawal
          </Body>
          <div className="w-full">
            <LocalLiftedButton
              onClick={() => setLevel("form")}
              // className="bg-surface-grey text-paper-main font-bold"
              width="full"
            >
              Try Again
            </LocalLiftedButton>
          </div>
        </>
      ) : (
        <form className="*:mb-6">
          <div>
            <Label htmlFor="address">Recipient Address</Label>
            <div className="relative">
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, address: e.target.value }))
                }
                id="address"
                className="w-full pr-[7.6rem] font-normal text-surface-ink"
                placeholder="0x"
              />
              {isConnected && (
                <button
                  type="button"
                  onClick={setRecipientAddress}
                  className="absolute right-0 top-1/2 -translate-y-1/2 mr-3 font-bold text-primary-blue text-sm"
                >
                  Use connected
                </button>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <NumericInput
                value={form.amount}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, amount: e.target.value }))
                }
                id="amount"
                className="w-full pr-[10.3rem]"
                allowDecimal
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-end gap-2.5">
                <div className="bg-paper-main p-1">
                  <Logo text="BREAD" size={24} />
                </div>
                <button
                  onClick={setMaxAmount}
                  type="button"
                  className={`font-bold mr-3 text-sm transition-colors ${isLoading ? "text-surface-grey" : "text-primary-blue"}`}
                >
                  Max.
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-surface-grey">
              <Body className="text-xs">
                ${formatBalance(Number(form.amount || 0), 2)}
              </Body>
              <Body className="text-xs flex items-center justify-end">
                Balance:{" "}
                {isLoading ? (
                  <CircularProgressIcon className="w-4! h-4! ml-1" />
                ) : (
                  <>{balance} BREAD</>
                )}
              </Body>
            </div>
          </div>
          <LocalLiftedButton
            onClick={withdraw}
            width="full"
            disabled={disableButton}
            className={cn(
              disableButton ? "bg-surface-grey text-paper-main" : ""
            )}
          >
            {buttonWithdrawContent}
            {/* <Loading /> */}
          </LocalLiftedButton>
        </form>
      )}
    </ModalContainer>
  );
};

export default WithdrawBreadModal;
