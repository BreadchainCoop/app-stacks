"use client";

import Input, { InputDescription } from "@/components/input";
import { Label } from "@/components/label";
import LocalButton from "@/components/button";
import { Body, Heading3, Logo } from "@breadcoop/ui";
import { UsersThreeIcon } from "@phosphor-icons/react";
import { MouseEventHandler, ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { GoalFormSchemaData } from "./schema";
import NumericInput from "@/components/numeric-input";
import { earliestDeadlineDate } from "@/utils/time";

const GoalForm = ({ onContinue }: { onContinue: () => void }) => {
  const form = useFormContext<GoalFormSchemaData>();
  const beneficiaryMode = form.watch("beneficiaryMode");

  const validateGoal: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();

    if (await form.trigger()) onContinue();
  };

  return (
    <div>
      <section className="bg-paper-0 p-6 flex flex-col gap-4 shadow-[0px_4px_12px_0px_#1B201A26]">
        <header>
          <Heading3 className="mb-4 pb-4 border-b border-blue-0 text-2xl">
            Create your goal savings
          </Heading3>
          <Body className="text-surface-grey">
            Save flexible amounts together toward a target by a deadline.
            Contributions are locked until the goal is decided.
          </Body>
        </header>
        <div className="flex flex-col gap-4 mb-4">
          <Field>
            <div>
              <Label htmlFor="name">Goal name</Label>
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
            <InputDescription desc="How many members do you want saving toward this goal?" />
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
              <Label htmlFor="goalAmount">Goal amount</Label>
            </div>
            <InputDescription desc="The target the group is saving toward. Deposits may overshoot it." />
            <div className="relative">
              <NumericInput
                {...form.register("goalAmount", {
                  valueAsNumber: true,
                })}
                id="goalAmount"
                className="w-full pr-12"
                allowDecimal
              />
              <div className="absolute top-1/2 -translate-y-1/2 right-3 p-1 bg-paper-main">
                <Logo text="BREAD" className="size-6" variant="square" />
              </div>
            </div>
            <ErrorMessage msg={form.formState.errors.goalAmount?.message} />
          </Field>
          <Field>
            <div>
              <Label htmlFor="deadline">Deadline</Label>
            </div>
            <InputDescription desc="Deposits close at midnight at the start of this date. If the goal isn't reached by then, everyone gets their money back." />
            <Input
              {...form.register("deadline")}
              id="deadline"
              type="date"
              min={earliestDeadlineDate()}
              className="w-full"
            />
            <ErrorMessage msg={form.formState.errors.deadline?.message} />
          </Field>
          <Field>
            <div>
              <Label htmlFor="beneficiaryMode">On success</Label>
            </div>
            <div className="flex flex-col gap-2">
              <RadioButton
                id="reclaim"
                checked={beneficiaryMode === "reclaim"}
                label="Reclaim"
                description=" (every member takes back exactly what they saved)"
                name="beneficiaryMode"
                onChange={() => {
                  form.setValue("beneficiaryMode", "reclaim");
                  form.clearErrors("beneficiary");
                }}
                value="reclaim"
              />
              <RadioButton
                id="beneficiary"
                checked={beneficiaryMode === "beneficiary"}
                label="Beneficiary"
                description=" (the whole pot is released to one address)"
                name="beneficiaryMode"
                onChange={() => form.setValue("beneficiaryMode", "beneficiary")}
                value="beneficiary"
              />
            </div>
            {beneficiaryMode === "beneficiary" && (
              <>
                <Input
                  {...form.register("beneficiary")}
                  id="beneficiaryAddress"
                  className="w-full"
                  placeholder="0x… beneficiary address"
                />
                <ErrorMessage
                  msg={form.formState.errors.beneficiary?.message}
                />
              </>
            )}
          </Field>
        </div>
        <LocalButton
          variant="secondary"
          className="font-bold lg:hidden"
          type="button"
          onClick={validateGoal}
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

export default GoalForm;
