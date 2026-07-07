"use client";

import Link from "next/link";
import {
  ArrowClockwiseIcon,
  ArrowRightIcon,
  CoinsIcon,
  FlagBannerFoldIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import { Body, cn, Heading2, Heading3 } from "@breadcoop/ui";
import { FeatureGate } from "@/components/feature-gate";
import { STACK_TYPE_DESCRIPTIONS, STACK_TYPE_LABELS } from "@/lib/stack-types";

/** A stack type the picker can start creating. */
type PickerCard =
  | {
      StackIcon: Icon;
      label: string;
      description: string;
      onSelect: () => void;
    }
  | { StackIcon: Icon; label: string; description: string; href: string };

const Card = ({ StackIcon, label, description, ...action }: PickerCard) => {
  const content = (
    <>
      <figure className="text-primary-blue">
        <StackIcon className="size-9" />
      </figure>
      <div className="flex-1">
        <Heading3 className="text-xl leading-6">{label}</Heading3>
        <Body className="mt-2 text-surface-grey-2">{description}</Body>
      </div>
      <ArrowRightIcon className="size-6 shrink-0 text-primary-blue" />
    </>
  );

  const className = cn(
    "card-shadow-border card-shadow-bg flex items-start gap-4 p-6 text-left",
    "transition-colors hover:border-primary-blue"
  );

  if ("href" in action) {
    return (
      <Link href={action.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onSelect} className={className}>
      {content}
    </button>
  );
};

const TypePicker = ({ onSelectRosca }: { onSelectRosca: () => void }) => {
  return (
    <section className="max-w-155 mx-auto">
      <header className="mb-6 text-center">
        <Heading2 className="text-primary-blue text-2xl leading-6">
          What kind of stack?
        </Heading2>
        <Body className="mt-3 text-surface-grey-2">
          Pick how your group wants to save together.
        </Body>
      </header>

      <div className="flex flex-col gap-4">
        <Card
          StackIcon={ArrowClockwiseIcon}
          label={STACK_TYPE_LABELS.rosca}
          description={STACK_TYPE_DESCRIPTIONS.rosca}
          onSelect={onSelectRosca}
        />
        <FeatureGate feature="asca">
          <Card
            StackIcon={CoinsIcon}
            label={STACK_TYPE_LABELS.asca}
            description={STACK_TYPE_DESCRIPTIONS.asca}
            href="/new/asca"
          />
        </FeatureGate>
        <FeatureGate feature="goalSavings">
          <Card
            StackIcon={FlagBannerFoldIcon}
            label={STACK_TYPE_LABELS.goal}
            description={STACK_TYPE_DESCRIPTIONS.goal}
            href="/new/goal"
          />
        </FeatureGate>
        <FeatureGate feature="collectiveFund">
          <Card
            StackIcon={UsersThreeIcon}
            label={STACK_TYPE_LABELS.collective}
            description={STACK_TYPE_DESCRIPTIONS.collective}
            href="/new/collective"
          />
        </FeatureGate>
      </div>
    </section>
  );
};

export default TypePicker;
