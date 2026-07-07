"use client";

import Alert from "@/components/alert";
import { CollectiveFund } from "@/hooks/use-collective-fund";
import { Chip, Heading2 } from "@breadcoop/ui";

const FundHeader = ({
  fund,
  id,
  isMember,
}: {
  fund: CollectiveFund | undefined;
  id: string;
  isMember: boolean;
}) => {
  // Collective funds are white-label: the display name lives on-chain, so
  // everyone (member or not) sees it.
  const fundName = fund?.name || `Fund ${id}`;

  return (
    <header className="mb-3.5 md:mb-6">
      <div className="flex flex-col flex-wrap gap-4 mb-5.25 sm:flex-row sm:items-center sm:justify-between md:mb-7.25">
        <Heading2 className="text-primary-blue text-2xl md:text-5xl">
          {fundName}
        </Heading2>
        {isMember && (
          <Chip className="border-system-green text-system-green bg-paper-main max-w-max hover:border-current">
            Member
          </Chip>
        )}
      </div>
      <Alert
        closeAble={false}
        variant="warning"
        title="The pool is spent by vote"
        description="Deposits mint shares 1:1. Approved proposals pay out of the shared pool and dilute every member pro-rata — you can leave anytime and take your share of what remains."
      />
    </header>
  );
};

export default FundHeader;
