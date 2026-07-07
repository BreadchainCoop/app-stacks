"use client";

import Alert from "@/components/alert";
import { useStackSupabase } from "@/hooks/use-stack-supabase";
import { stackMetadataId } from "@/lib/stack-types";
import { Chip, Heading2 } from "@breadcoop/ui";

const FundHeader = ({
  id,
  isMember,
  deactivated,
}: {
  id: string;
  isMember: boolean;
  deactivated: boolean;
}) => {
  const { data: stackMetadata } = useStackSupabase(
    stackMetadataId("asca", id),
    isMember
  );

  const fundName = isMember
    ? (stackMetadata?.stackname ?? `Fund ${id}`)
    : `Fund ${id}`;

  return (
    <header className="mb-3.5 md:mb-6">
      <div className="flex flex-col flex-wrap gap-4 mb-5.25 sm:flex-row sm:items-center sm:justify-between md:mb-7.25">
        <Heading2 className="text-primary-blue text-2xl md:text-5xl">
          {fundName}
        </Heading2>
        <div className="flex items-center gap-2">
          {isMember && (
            <Chip className="border-system-green text-system-green bg-paper-main max-w-max hover:border-current">
              Member
            </Chip>
          )}
          {deactivated && (
            <Chip className="border-system-red text-system-red bg-paper-main max-w-max hover:border-current">
              Deactivated
            </Chip>
          )}
        </div>
      </div>
      {deactivated ? (
        <Alert
          closeAble={false}
          variant="warning"
          title="This fund has been deactivated"
          description="New deposits, loans and invites are closed. You can still withdraw your savings, repay your loan and claim your interest."
        />
      ) : (
        <Alert
          closeAble={false}
          variant="warning"
          title="Loans are collateralized by your own savings"
          description="You can borrow up to the fund's borrow limit of your savings. If a loan is not repaid by its due date, the borrower's savings are seized to cover it."
        />
      )}
    </header>
  );
};

export default FundHeader;
