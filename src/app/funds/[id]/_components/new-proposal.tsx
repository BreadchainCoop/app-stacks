"use client";

import Input, { InputDescription } from "@/components/input";
import LocalButton from "@/components/button";
import NumericInput from "@/components/numeric-input";
import { Label } from "@/components/label";
import { useModal } from "@/components/modal/context";
import { COLLECTIVE_PROPOSE_ERRORS } from "@/lib/contract-errors";
import { Body, Heading3, Logo } from "@breadcoop/ui";
import { useState } from "react";
import { Address, isAddress, parseEther } from "viem";
import { useCollectiveAction } from "./use-collective-action";

const NewProposal = ({ fundId }: { fundId: bigint }) => {
  const { setModal } = useModal();
  const { runCollectiveAction } = useCollectiveAction();
  const [recipient, setRecipient] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [description, setDescription] = useState("");

  const amount = amountInput ? parseEther(amountInput) : BigInt(0);
  const isValid = isAddress(recipient) && amount > BigInt(0);

  const propose = () => {
    if (!isValid) return;

    setModal({
      type: "STACK_TX_INIT",
      stackType: "collective",
      action: "propose",
      id: fundId,
      amount,
      onConfirm: () =>
        runCollectiveAction({
          action: "propose",
          functionName: "propose",
          args: [fundId, recipient as Address, amount, description],
          errors: COLLECTIVE_PROPOSE_ERRORS,
        }),
    });
  };

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">New proposal</Heading3>
      </header>
      <Body className="text-surface-grey">
        Propose paying someone from the pool. You automatically vote yes, and
        the proposal passes once enough members approve it.
      </Body>
      <div className="flex flex-col gap-2">
        <Label htmlFor="proposalRecipient">Recipient</Label>
        <Input
          id="proposalRecipient"
          className="w-full"
          placeholder="0x… recipient address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        {recipient && !isAddress(recipient) && (
          <p className="text-red-500 text-sm">Provide a valid address</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="proposalAmount">Amount</Label>
        <div className="relative">
          <NumericInput
            id="proposalAmount"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            className="w-full"
            placeholder="Amount"
            allowDecimal
          />
          <div className="absolute top-1/2 -translate-y-1/2 right-3 p-1 bg-paper-main">
            <Logo text="BREAD" className="size-6" variant="square" />
          </div>
        </div>
        <InputDescription desc="The amount isn't reserved — the pool must still hold it when the proposal is executed." />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="proposalDescription">Description</Label>
        <Input
          id="proposalDescription"
          className="w-full"
          placeholder="What is this payment for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <LocalButton
        className="w-full font-bold"
        onClick={propose}
        disabled={!isValid}
      >
        Create proposal
      </LocalButton>
    </section>
  );
};

export default NewProposal;
