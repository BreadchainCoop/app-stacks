"use client";

import { FeatureGate } from "@/components/feature-gate";
import { CircularProgressIcon } from "@/components/icons/circular-progress";
import { useConditionalGrant } from "@/hooks/use-conditional-grant";
import { Body, useConnectedUser } from "@breadcoop/ui";
import GranteeActions from "./grantee-actions";
import GrantPanel from "./grant-panel";
import GrantHeader from "./header";
import GrantorActions from "./grantor-actions";
import GrantOverview from "./grant-overview";

const PageContent = ({ id }: { id: string }) => {
  return (
    <FeatureGate feature="conditionalGrants">
      {/^\d+$/.test(id) ? (
        <ConditionalGrantPageContent id={id} />
      ) : (
        <Body className="text-system-red">
          This conditional grant does not exist.
        </Body>
      )}
    </FeatureGate>
  );
};

export type GrantRole = "grantor" | "grantee" | undefined;

const ConditionalGrantPageContent = ({ id }: { id: string }) => {
  const grantId = BigInt(id);
  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;
  const conditionalGrant = useConditionalGrant(grantId);
  const { terms, status, state, outstanding } = conditionalGrant;

  const role: GrantRole =
    address && status
      ? status.grantor.toLowerCase() === address.toLowerCase()
        ? "grantor"
        : status.grantee.toLowerCase() === address.toLowerCase()
          ? "grantee"
          : undefined
      : undefined;

  return (
    <>
      <GrantHeader
        id={id}
        role={role}
        state={state}
        noDeadline={status?.payBackBy === BigInt(0)}
      />
      {terms && status && state !== undefined && outstanding !== undefined ? (
        <div className="*:mb-4 last:mb-0 md:mb-6 md:last:mb-0">
          <GrantOverview
            grantId={grantId}
            terms={terms}
            status={status}
            state={state}
            outstanding={outstanding}
          />
          <GrantPanel grantId={grantId} terms={terms} state={state} />
          {role === "grantee" && (
            <GranteeActions
              grantId={grantId}
              terms={terms}
              state={state}
              outstanding={outstanding}
            />
          )}
          {role === "grantor" && (
            <GrantorActions
              grantId={grantId}
              terms={terms}
              status={status}
              state={state}
              reclaimableAt={conditionalGrant.reclaimableAt ?? BigInt(0)}
            />
          )}
        </div>
      ) : conditionalGrant.error ? (
        <Body className="text-system-red">
          Unable to load this conditional grant.
        </Body>
      ) : (
        <div className="flex items-center justify-center">
          <CircularProgressIcon />
        </div>
      )}
    </>
  );
};

export default PageContent;
