"use client";

import Input, { InputDescription } from "@/components/input";
import { Label } from "@/components/label";
import LocalButton from "@/components/button";
import { Body, Heading3 } from "@breadcoop/ui";
import { PercentIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { MouseEventHandler, ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { AscaFormSchemaData } from "./schema";
import NumericInput from "@/components/numeric-input";
import { DEPOSIT_INTERVALS } from "@/utils/deposit-interval";

const AscaForm = ({ onContinue }: { onContinue: () => void }) => {
  const form = useFormContext<AscaFormSchemaData>();
  const periodLength = form.watch("periodLength");

  const validateFund: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();

    if (await form.trigger()) onContinue();
  };

  return (
    <div>
      <section className="bg-paper-0 p-6 flex flex-col gap-4 shadow-[0px_4px_12px_0px_#1B201A26]">
        <header>
          <Heading3 className="mb-4 pb-4 border-b border-blue-0 text-2xl">
            Create your savings & credit fund
          </Heading3>
          <Body className="text-surface-grey">
            Members deposit flexible amounts, earn interest, and can borrow
            against their own savings.
          </Body>
        </header>
        <div className="flex flex-col gap-4 mb-4">
          <Field>
            <div>
              <Label htmlFor="name">Fund name</Label>
            </div>
            <Input
              {...form.register("name")}
              id="name"
              className="w-full"
              placeholder="Group name"
            />
            <ErrorMessage msg={form.formState.errors.name?.message} />
          </Field>
          <Field>
            <div>
              <Label htmlFor="members">Max. amount of members</Label>
            </div>
            <InputDescription desc="How many members do you want in your fund?" />
            <div className="relative">
              <span className="text-primary-blue absolute top-1/2 -translate-y-1/2 left-[0.796875rem]">
                <UsersThreeIcon size={24} />
              </span>
              <NumericInput
                {...form.register("members", {
                  valueAsNumber: true,
                })}
                id="members"
                className="w-full pl-12 pr-22"
              />
              <Body
                bold
                className="absolute top-1/2 -translate-y-1/2 right-3 text-surface-grey"
              >
                Members
              </Body>
            </div>
            <ErrorMessage msg={form.formState.errors.members?.message} />
          </Field>
          <Field>
            <div>
              <Label htmlFor="borrowLimit">Borrow limit</Label>
            </div>
            <InputDescription desc="How much of their own savings members can borrow, up to 100%." />
            <PercentInput id="borrowLimit" name="borrowLimit" />
            <ErrorMessage msg={form.formState.errors.borrowLimit?.message} />
          </Field>
          <Field>
            <div>
              <Label htmlFor="interestRate">Interest rate per period</Label>
            </div>
            <InputDescription desc="Simple interest charged on loans every period. It is paid out to savers." />
            <PercentInput id="interestRate" name="interestRate" allowDecimal />
            <ErrorMessage msg={form.formState.errors.interestRate?.message} />
          </Field>
          <Field>
            <div>
              <Label htmlFor="periodLength">Period length</Label>
            </div>
            <div className="flex flex-col gap-2">
              {DEPOSIT_INTERVALS.map((interval) => (
                <RadioButton
                  key={interval.id}
                  id={interval.id}
                  checked={periodLength === interval.id}
                  label={interval.label}
                  description={` (every ${(interval.description || interval.label).toLowerCase()})`}
                  name="periodLength"
                  onChange={() => {
                    form.setValue("periodLength", interval.id);
                    form.clearErrors("periodLength");
                  }}
                  value={interval.id}
                />
              ))}
            </div>
            <ErrorMessage msg={form.formState.errors.periodLength?.message} />
          </Field>
          <Field>
            <div>
              <Label htmlFor="repaymentPeriods">Repayment periods</Label>
            </div>
            <InputDescription desc="A loan is due after this many periods. Interest stops accruing at the due date." />
            <div className="relative">
              <NumericInput
                {...form.register("repaymentPeriods", {
                  valueAsNumber: true,
                })}
                id="repaymentPeriods"
                className="w-full pr-22"
              />
              <Body
                bold
                className="absolute top-1/2 -translate-y-1/2 right-3 text-surface-grey"
              >
                Periods
              </Body>
            </div>
            <ErrorMessage
              msg={form.formState.errors.repaymentPeriods?.message}
            />
          </Field>
        </div>
        <LocalButton
          variant="secondary"
          className="font-bold lg:hidden"
          type="button"
          onClick={validateFund}
        >
          Continue
        </LocalButton>
      </section>
    </div>
  );
};

function PercentInput({
  id,
  name,
  allowDecimal,
}: {
  id: string;
  name: "borrowLimit" | "interestRate";
  allowDecimal?: boolean;
}) {
  const form = useFormContext<AscaFormSchemaData>();

  return (
    <div className="relative">
      <NumericInput
        {...form.register(name, {
          valueAsNumber: true,
        })}
        id={id}
        className="w-full pr-12"
        allowDecimal={allowDecimal}
      />
      <span className="text-primary-blue absolute top-1/2 -translate-y-1/2 right-3">
        <PercentIcon size={24} />
      </span>
    </div>
  );
}

function Field({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

interface RadioButtonProps {
  id: string;
  name: string;
  value: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function RadioButton({
  id,
  name,
  value,
  label,
  description,
  checked,
  onChange,
}: RadioButtonProps) {
  return (
    <div className="bg-paper-1 p-3">
      <label
        htmlFor={id}
        className="flex items-center justify-start gap-2 cursor-pointer"
      >
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 border-jade-2 cursor-pointer"
        />
        <div className="">
          <span className="text-body font-bold capitalize">{label}</span>
          <span className="text-body">{description}</span>
        </div>
      </label>
    </div>
  );
}

function ErrorMessage({ msg }: { msg?: string }) {
  if (!msg) return null;

  return <p className="text-red-500 text-sm">{msg}</p>;
}

export default AscaForm;
