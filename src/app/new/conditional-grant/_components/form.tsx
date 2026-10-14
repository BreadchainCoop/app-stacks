"use client";

import Input, { InputDescription } from "@/components/input";
import { Label } from "@/components/label";
import LocalButton from "@/components/button";
import NumericInput from "@/components/numeric-input";
import { DEPOSIT_TOKEN } from "@/lib/deposit-token";
import { earliestDeadlineDate } from "@/utils/time";
import { Body, Heading3, Logo } from "@breadcoop/ui";
import { MouseEventHandler, ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { ConditionalGrantFormSchemaData } from "./schema";

const ConditionalGrantForm = ({ onContinue }: { onContinue: () => void }) => {
  const form = useFormContext<ConditionalGrantFormSchemaData>();
  const { errors } = form.formState;

  const validate: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();

    if (await form.trigger()) onContinue();
  };

  return (
    <div>
      <section className="bg-paper-0 p-6 flex flex-col gap-4 shadow-[0px_4px_12px_0px_#1B201A26]">
        <header>
          <Heading3 className="mb-4 pb-4 border-b border-blue-0 text-2xl">
            Offer a conditional grant
          </Heading3>
          <Body className="text-surface-grey">
            Advance money to one grantee with no interest. The grant is held in
            escrow and sent to the grantee once they pay back the advance in
            full.
          </Body>
        </header>
        <div className="flex flex-col gap-4 mb-4">
          <Field>
            <Label htmlFor="advance">Advance</Label>
            <InputDescription desc="Sent to the grantee when they accept" />
            <TokenInput>
              <NumericInput
                {...form.register("advance", { valueAsNumber: true })}
                id="advance"
                className="w-full pr-12"
                allowDecimal
              />
            </TokenInput>
            <ErrorMessage msg={errors.advance?.message} />
          </Field>
          <Field>
            <Label htmlFor="grant">Grant on pay-back</Label>
            <InputDescription desc="Released to the grantee once the advance is fully paid back. Use 0 for no grant." />
            <TokenInput>
              <NumericInput
                {...form.register("grant", { valueAsNumber: true })}
                id="grant"
                className="w-full pr-12"
                allowDecimal
              />
            </TokenInput>
            <ErrorMessage msg={errors.grant?.message} />
          </Field>
          <Field>
            <Label htmlFor="grantee">Grantee address</Label>
            <InputDescription desc="Only this wallet can accept. You can leave it empty and add it later." />
            <Input
              {...form.register("grantee")}
              id="grantee"
              className="w-full"
              placeholder="0x… (optional)"
            />
            <ErrorMessage msg={errors.grantee?.message} />
          </Field>
          <Field>
            <Label htmlFor="acceptBy">Offer open until</Label>
            <InputDescription desc="The grantee must accept before 12am (midnight) on this date. After that you can cancel for a full refund." />
            <Input
              {...form.register("acceptBy")}
              id="acceptBy"
              type="date"
              min={earliestDeadlineDate()}
              className="w-full"
            />
            <ErrorMessage msg={errors.acceptBy?.message} />
          </Field>
          <Field>
            <Label htmlFor="payBackDays">Time to pay back</Label>
            <InputDescription desc="Days the grantee has after accepting to pay back and earn the grant" />
            <div className="relative">
              <NumericInput
                {...form.register("payBackDays", { valueAsNumber: true })}
                id="payBackDays"
                className="w-full pr-16"
              />
              <Body
                bold
                className="absolute top-1/2 -translate-y-1/2 right-3 text-surface-grey"
              >
                Days
              </Body>
            </div>
            <ErrorMessage msg={errors.payBackDays?.message} />
          </Field>
          <Field>
            <Label htmlFor="agreement">Agreement (optional)</Label>
            <InputDescription desc="The conditions in plain language. Share this exact text with the grantee: they paste it to accept, which records on-chain that they agreed to it." />
            <textarea
              {...form.register("agreement")}
              id="agreement"
              rows={4}
              className="w-full border border-paper-2 bg-paper-1 py-3 px-4 placeholder:text-surface-grey text-surface-grey-2 placeholder:font-light"
              placeholder="e.g. 1,000 USDT for computers, paid back in monthly installments"
            />
          </Field>
        </div>
        <LocalButton
          variant="secondary"
          className="font-bold lg:hidden"
          type="button"
          onClick={validate}
        >
          Continue
        </LocalButton>
      </section>
    </div>
  );
};

function TokenInput({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div className="absolute top-1/2 -translate-y-1/2 right-3 p-1 bg-paper-main">
        <Logo text={DEPOSIT_TOKEN.symbol} className="size-6" variant="square" />
      </div>
    </div>
  );
}

function Field({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

function ErrorMessage({ msg }: { msg?: string }) {
  if (!msg) return null;

  return <p className="text-red-500 text-sm">{msg}</p>;
}

export default ConditionalGrantForm;
