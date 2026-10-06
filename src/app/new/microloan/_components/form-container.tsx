"use client";

import { useState } from "react";
import MicroloanForm from "./form";
import MicroloanOverviewForm from "./overview";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import microloanSchema, { MicroloanFormSchemaData } from "./schema";
import { Heading2 } from "@breadcoop/ui";

const MicroloanFormContainer = () => {
  const form = useForm<MicroloanFormSchemaData>({
    resolver: zodResolver(microloanSchema),
    defaultValues: {
      borrower: "",
      grant: 0,
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
            New Microloan
          </Heading2>
        </header>
        <div className="lg:flex lg:gap-6">
          {/* Form: Hidden on mobile when overview is shown */}
          <div className={`flex-1 ${showOverview ? "hidden lg:block" : ""}`}>
            <MicroloanForm onContinue={() => setShowOverview(true)} />
          </div>

          {/* Overview: Hidden on mobile until Continue is clicked */}
          <div className={`flex-1 ${showOverview ? "" : "hidden lg:block"}`}>
            <MicroloanOverviewForm onBack={() => setShowOverview(false)} />
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default MicroloanFormContainer;
