"use client";

import Input, { InputDescription } from "@/components/input";
import { Label } from "@/components/label";
import LocalButton from "@/components/button";
import { Body, Heading3 } from "@breadcoop/ui";
import { UsersThreeIcon } from "@phosphor-icons/react";
import { MouseEventHandler, ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { APPROVAL_THRESHOLDS, CollectiveFormSchemaData } from "./schema";
import NumericInput from "@/components/numeric-input";
import { DEPOSIT_INTERVALS } from "@/utils/deposit-interval";

const CollectiveForm = ({ onContinue }: { onContinue: () => void }) => {
  const form = useFormContext<CollectiveFormSchemaData>();
  const votingPeriod = form.watch("votingPeriod");
  const approvalThreshold = form.watch("approvalThreshold");

  const validateFund: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();

    if (await form.trigger()) onContinue();
  };

  return (
    <div>
      <section className="bg-paper-0 p-6 flex flex-col gap-4 shadow-[0px_4px_12px_0px_#1B201A26]">
        <header>
          <Heading3 className="mb-4 pb-4 border-b border-blue-0 text-2xl">
            Create your collective fund
          </Heading3>
          <Body className="text-surface-grey">
            Pool money as a community, propose and vote on how to spend it, and
            leave anytime with your share of what remains.
          </Body>
        </header>
        <div className="flex flex-col gap-4 mb-4">
          <Field>
            <div>
              <Label htmlFor="name">Fund name</Label>
            </div>
            <InputDescription desc="The name is stored on-chain and visible to everyone." />
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
              <Label htmlFor="votingPeriod">Voting period</Label>
            </div>
            <InputDescription desc="How long each spending proposal accepts votes." />
            <div className="flex flex-col gap-2">
              {DEPOSIT_INTERVALS.map((interval) => (
                <RadioButton
                  key={interval.id}
                  id={interval.id}
                  checked={votingPeriod === interval.id}
                  label={interval.label}
                  description={` (voting stays open for one ${(interval.description || interval.label).toLowerCase()})`}
                  name="votingPeriod"
                  onChange={() => {
                    form.setValue("votingPeriod", interval.id);
                    form.clearErrors("votingPeriod");
                  }}
                  value={interval.id}
                />
              ))}
            </div>
            <ErrorMessage msg={form.formState.errors.votingPeriod?.message} />
          </Field>
          <Field>
            <div>
              <Label htmlFor="approvalThreshold">Approval threshold</Label>
            </div>
            <InputDescription desc="The share of members that must vote yes before a proposal can be executed." />
            <div className="flex flex-col gap-2">
              {APPROVAL_THRESHOLDS.map((threshold) => (
                <RadioButton
                  key={threshold.id}
                  id={threshold.id}
                  checked={approvalThreshold === threshold.id}
                  label={threshold.label}
                  description={` (${threshold.description})`}
                  name="approvalThreshold"
                  onChange={() => {
                    form.setValue("approvalThreshold", threshold.id);
                    form.clearErrors("approvalThreshold");
                  }}
                  value={threshold.id}
                />
              ))}
            </div>
            <ErrorMessage
              msg={form.formState.errors.approvalThreshold?.message}
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

export default CollectiveForm;
