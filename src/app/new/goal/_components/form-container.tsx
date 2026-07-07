"use client";

import { useState } from "react";
import GoalForm from "./form";
import GoalOverviewForm from "./overview";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import goalSchema, { GoalFormSchemaData } from "./schema";
import { Heading2 } from "@breadcoop/ui";

const GoalFormContainer = () => {
  const form = useForm<GoalFormSchemaData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      deadline: "",
      beneficiaryMode: "reclaim",
      beneficiary: "",
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
            New Goal Savings
          </Heading2>
        </header>
        <div className="lg:flex lg:gap-6">
          {/* Form: Hidden on mobile when overview is shown */}
          <div className={`flex-1 ${showOverview ? "hidden lg:block" : ""}`}>
            <GoalForm onContinue={handleContinue} />
          </div>

          {/* Overview: Hidden on mobile until Continue is clicked */}
          <div className={`flex-1 ${showOverview ? "" : "hidden lg:block"}`}>
            <GoalOverviewForm onBack={handleBack} />
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default GoalFormContainer;
