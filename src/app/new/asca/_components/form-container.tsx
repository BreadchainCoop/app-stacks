"use client";

import { useState } from "react";
import AscaForm from "./form";
import AscaOverviewForm from "./overview";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ascaSchema, { AscaFormSchemaData } from "./schema";
import { Heading2 } from "@breadcoop/ui";
import { DEPOSIT_INTERVALS } from "@/utils/deposit-interval";

const firstId = DEPOSIT_INTERVALS[0].id;

const AscaFormContainer = () => {
  const form = useForm<AscaFormSchemaData>({
    resolver: zodResolver(ascaSchema),
    defaultValues: {
      name: "",
      periodLength: firstId,
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
            New Savings & Credit Fund
          </Heading2>
        </header>
        <div className="lg:flex lg:gap-6">
          {/* Form: Hidden on mobile when overview is shown */}
          <div className={`flex-1 ${showOverview ? "hidden lg:block" : ""}`}>
            <AscaForm onContinue={handleContinue} />
          </div>

          {/* Overview: Hidden on mobile until Continue is clicked */}
          <div className={`flex-1 ${showOverview ? "" : "hidden lg:block"}`}>
            <AscaOverviewForm onBack={handleBack} />
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default AscaFormContainer;
