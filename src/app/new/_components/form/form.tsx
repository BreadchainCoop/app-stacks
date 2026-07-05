"use client";

import Input, { InputDescription } from "@/components/input";
import { Label } from "@/components/label";
import LocalButton from "@/components/button";
import { Body, Heading3, Logo } from "@breadcoop/ui";
import { UsersThreeIcon } from "@phosphor-icons/react";
import { MouseEventHandler, ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { StackFormSchemaData } from "./schema";
import NumericInput from "@/components/numeric-input";
import { DEPOSIT_INTERVALS, getIntervalById } from "@/utils/deposit-interval";

const StackForm = ({ onContinue }: { onContinue: () => void }) => {
  const form = useFormContext<StackFormSchemaData>();
  const depositInterval = form.watch("depositInterval");
  const interval = getIntervalById(depositInterval);

  const validateStack: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();

    if (await form.trigger()) onContinue();
  };

  return (
    <div>
      <section className="bg-paper-0 p-6 flex flex-col gap-4 shadow-[0px_4px_12px_0px_#1B201A26]">
        <header>
          <Heading3 className="mb-4 pb-4 border-b border-blue-0 text-2xl">
            Create your new Stack
          </Heading3>
          <Body className="text-surface-grey">
            Fill in the details for your Stack. Currently Stacks allows a stacks
            to only.
          </Body>
        </header>
        <div className="flex flex-col gap-4 mb-4">
          <Field>
            <div>
              <Label htmlFor="name">Stacks name</Label>
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
            <InputDescription desc="How many members do you want in your group?" />
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
              <Label htmlFor="depositAmount">
                <span className="capitalize">{interval?.label}</span> deposit
                for each member
              </Label>
            </div>
            <InputDescription desc="The total amount of money you want to stack up with friends every week or month." />
            <InputDescription desc="1 BREAD = 1 USD" className="text-xs" />
            <div className="relative">
              <NumericInput
                {...form.register("depositAmount", {
                  valueAsNumber: true,
                })}
                id="depositAmount"
                className="w-full"
                allowDecimal
              />
              <div className="absolute top-1/2 -translate-y-1/2 right-3 p-1 bg-paper-main">
                <Logo text="BREAD" className="size-6" variant="square" />
              </div>
            </div>
            <ErrorMessage msg={form.formState.errors.depositAmount?.message} />
          </Field>
          {DEPOSIT_INTERVALS.length > 1 && (
            <Field>
              <div>
                <Label htmlFor="depositInterval">Deposit Interval</Label>
              </div>
              <div className="flex flex-col gap-2">
                {DEPOSIT_INTERVALS.map((interval) => (
                  <RadioButton
                    key={interval.id}
                    id={interval.id}
                    checked={depositInterval === interval.id}
                    label={interval.label}
                    description={` (every ${(interval.description || interval.label).toLowerCase()})`}
                    name="depositInterval"
                    onChange={() => {
                      form.setValue("depositInterval", interval.id);
                      form.clearErrors("depositInterval");
                    }}
                    value={interval.id}
                  />
                ))}
              </div>
              <ErrorMessage
                msg={form.formState.errors.depositInterval?.message}
              />
            </Field>
          )}
        </div>
        <LocalButton
          variant="secondary"
          className="font-bold lg:hidden"
          type="button"
          onClick={validateStack}
        >
          Continue
        </LocalButton>
      </section>
    </div>
  );
};

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
          // className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
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

export default StackForm;
