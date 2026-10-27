"use client";

import { useState } from "react";
import ConditionalGrantForm from "./form";
import ConditionalGrantOverviewForm from "./overview";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import conditionalGrantSchema, {
  ConditionalGrantFormSchemaData,
} from "./schema";
import { Heading2 } from "@breadcoop/ui";

const ConditionalGrantFormContainer = () => {
  const form = useForm<ConditionalGrantFormSchemaData>({
    resolver: zodResolver(conditionalGrantSchema),
    defaultValues: {
      grantee: "",
      grant: 0,
      fee: 0,
      noDeadline: false,
      acceptBy: "",
      agreement: "",
    },
  });
  const [showOverview, setShowOverview] = useState(false);

  return (
    <FormProvider {...form}>
      <form>
        <header className="mb-6.25 md:mb-6">
          <Heading2 className="text-primary-blue text-[2.5rem] leading-9 md:text-5xl">
            New Conditional Grant
          </Heading2>
        </header>
        <div className="lg:flex lg:gap-6">
          {/* Form: Hidden on mobile when overview is shown */}
          <div className={`flex-1 ${showOverview ? "hidden lg:block" : ""}`}>
            <ConditionalGrantForm onContinue={() => setShowOverview(true)} />
          </div>

          {/* Overview: Hidden on mobile until Continue is clicked */}
          <div className={`flex-1 ${showOverview ? "" : "hidden lg:block"}`}>
            <ConditionalGrantOverviewForm
              onBack={() => setShowOverview(false)}
            />
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ConditionalGrantFormContainer;
