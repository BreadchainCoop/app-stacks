"use client";

import { FeatureGate } from "@/components/feature-gate";
import { CircularProgressIcon } from "@/components/icons/circular-progress";
import { useAscaFund } from "@/hooks/use-asca-fund";
import { useAscaMemberPosition } from "@/hooks/use-asca-member-position";
import { Body, useConnectedUser } from "@breadcoop/ui";
import FundHeader from "./header";
import FundOverview from "./fund-overview";
import MemberPosition from "./member-position";
import LoanPanel from "./loan-panel";
import FundMembers from "./members";
import OwnerActions from "./owner-actions";

const PageContent = ({ id }: { id: string }) => {
  return (
    <FeatureGate feature="asca">
      <AscaPageContent id={id} />
    </FeatureGate>
  );
};

const AscaPageContent = ({ id }: { id: string }) => {
  const fundId = BigInt(id);
  const { user } = useConnectedUser();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;
  const fundResult = useAscaFund(fundId);
  const { position } = useAscaMemberPosition(fundId, address);
  const isMember = position?.isMember ?? false;

  return (
    <>
      <FundHeader
        id={id}
        isMember={isMember}
        deactivated={fundResult.data?.deactivated ?? false}
      />
      {fundResult.data ? (
        <div className="*:mb-4 last:mb-0 md:mb-6 md:last:mb-0">
          <FundOverview fundId={fundId} fund={fundResult.data} />
          {isMember && (
            <>
              <MemberPosition fundId={fundId} fund={fundResult.data} />
              <LoanPanel fundId={fundId} fund={fundResult.data} />
            </>
          )}
          <FundMembers
            id={id}
            fund={fundResult.data}
            member={address}
            isMember={isMember}
          />
          <OwnerActions fundId={fundId} fund={fundResult.data} />
        </div>
      ) : fundResult.error ? (
        <Body className="text-system-red">Unable to get fund data!</Body>
      ) : (
        <div className="flex items-center justify-center">
          <CircularProgressIcon />
        </div>
      )}
    </>
  );
};

export default PageContent;
