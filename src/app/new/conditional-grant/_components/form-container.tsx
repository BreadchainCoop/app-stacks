"use client";

import { useState } from "react";
import BackPage from "@/components/back-page";
import OnboardingTutorials from "@/app/new/_components/onboarding/tutorials";
import { CONDITIONAL_GRANT_TUTORIALS } from "@/app/new/_components/onboarding/tutorial-content";
import { useChainPath } from "@/components/providers/active-chain";
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
      granteeLabel: "",
      noDeadline: false,
      acceptBy: "",
      agreement: "",
    },
  });
  const [showOverview, setShowOverview] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  // The back link carries the active chain, which only a client component can read
  const chainHref = useChainPath();

  if (showTutorial) {
    return (
      <>
        <BackPage href={chainHref("/new")} label="Back to stack types" />
        <OnboardingTutorials
          tutorials={CONDITIONAL_GRANT_TUTORIALS}
          nextStage={() => setShowTutorial(false)}
        />
      </>
    );
  }

  return (
    <FormProvider {...form}>
      <BackPage href={chainHref("/new")} label="Back to stack types" />
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
