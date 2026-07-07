"use client";

import { useState } from "react";
import CollectiveForm from "./form";
import CollectiveOverviewForm from "./overview";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import collectiveSchema, { CollectiveFormSchemaData } from "./schema";
import { Heading2 } from "@breadcoop/ui";

const CollectiveFormContainer = () => {
  const form = useForm<CollectiveFormSchemaData>({
    resolver: zodResolver(collectiveSchema),
    defaultValues: {
      name: "",
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
            New Collective Fund
          </Heading2>
        </header>
        <div className="lg:flex lg:gap-6">
          {/* Form: Hidden on mobile when overview is shown */}
          <div className={`flex-1 ${showOverview ? "hidden lg:block" : ""}`}>
            <CollectiveForm onContinue={handleContinue} />
          </div>

          {/* Overview: Hidden on mobile until Continue is clicked */}
          <div className={`flex-1 ${showOverview ? "" : "hidden lg:block"}`}>
            <CollectiveOverviewForm onBack={handleBack} />
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default CollectiveFormContainer;
