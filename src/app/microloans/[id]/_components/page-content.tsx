"use client";

import { FeatureGate } from "@/components/feature-gate";
import { CircularProgressIcon } from "@/components/icons/circular-progress";
import { useMicroloan } from "@/hooks/use-microloan";
import { Body, useConnectedUser } from "@breadcoop/ui";
import BorrowerActions from "./borrower-actions";
import GrantPanel from "./grant-panel";
import LoanHeader from "./header";
import LenderActions from "./lender-actions";
import LoanOverview from "./loan-overview";

const PageContent = ({ id }: { id: string }) => {
  return (
    <FeatureGate feature="microloans">
      {/^\d+$/.test(id) ? (
        <LoanPageContent id={id} />
      ) : (
        <Body className="text-system-red">This loan does not exist.</Body>
      )}
    </FeatureGate>
  );
};

export type LoanRole = "lender" | "borrower" | undefined;

const LoanPageContent = ({ id }: { id: string }) => {
  const loanId = BigInt(id);
  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;
  const loan = useMicroloan(loanId);
  const { terms, status, state, outstanding } = loan;

  const role: LoanRole =
    address && status
      ? status.lender.toLowerCase() === address.toLowerCase()
        ? "lender"
        : status.borrower.toLowerCase() === address.toLowerCase()
          ? "borrower"
          : undefined
      : undefined;

  return (
    <>
      <LoanHeader id={id} role={role} state={state} />
      {terms && status && state !== undefined && outstanding !== undefined ? (
        <div className="*:mb-4 last:mb-0 md:mb-6 md:last:mb-0">
          <LoanOverview
            loanId={loanId}
            terms={terms}
            status={status}
            state={state}
            outstanding={outstanding}
          />
          <GrantPanel loanId={loanId} terms={terms} state={state} />
          {role === "borrower" && (
            <BorrowerActions
              loanId={loanId}
              terms={terms}
              state={state}
              outstanding={outstanding}
            />
          )}
          {role === "lender" && (
            <LenderActions
              loanId={loanId}
              terms={terms}
              status={status}
              state={state}
            />
          )}
        </div>
      ) : loan.error ? (
        <Body className="text-system-red">Unable to get loan data!</Body>
      ) : (
        <div className="flex items-center justify-center">
          <CircularProgressIcon />
        </div>
      )}
    </>
  );
};

export default PageContent;
