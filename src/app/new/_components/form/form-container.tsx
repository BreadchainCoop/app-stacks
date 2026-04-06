"use client";

import { useState } from "react";
import StackForm from "./form";
import StackOverviewForm from "./overview";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import stackSchema, { StackFormSchemaData } from "./schema";
import { Heading2 } from "@breadcoop/ui";
import { useSearchParams } from "next/navigation";
import { DEPOSIT_INTERVALS } from "@/utils/deposit-interval";

const validIds = new Set(DEPOSIT_INTERVALS.map((i) => i.id));
const firstId = DEPOSIT_INTERVALS[0].id;

const StackFormContainer = () => {
  const params = useSearchParams();
  const interval = params.get("interval");
  console.log({ validIds, firstId });
  console.log("Interval from ", { interval });
  const form = useForm<StackFormSchemaData>({
    resolver: zodResolver(stackSchema),
    defaultValues: {
      name: "",
      members: params.get("members")
        ? Number(params.get("members"))
        : undefined,
      depositAmount: params.get("amount")
        ? Number(params.get("amount"))
        : undefined,
      depositInterval: validIds.has(interval ?? "") ? interval! : firstId,
    },
  });
  const [showOverview, setShowOverview] = useState(false);

  const handleContinue = () => {
    setShowOverview(true);
  };

  const handleBack = () => {
    setShowOverview(false);
  };

  return (
    <FormProvider {...form}>
      <form>
        <header className="mb-6.25 md:mb-6">
          <Heading2 className="text-primary-blue text-[2.5rem] leading-9 md:text-5xl">
            New Stack
          </Heading2>
        </header>
        <div className="lg:flex lg:gap-6">
          {/* Form: Hidden on mobile when overview is shown */}
          <div className={`flex-1 ${showOverview ? "hidden lg:block" : ""}`}>
            <StackForm onContinue={handleContinue} />
          </div>

          {/* Overview: Hidden on mobile until Continue is clicked */}
          <div className={`flex-1 ${showOverview ? "" : "hidden lg:block"}`}>
            <StackOverviewForm onBack={handleBack} />
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default StackFormContainer;
