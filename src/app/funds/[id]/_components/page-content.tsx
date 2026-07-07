"use client";

import { FeatureGate } from "@/components/feature-gate";
import { CircularProgressIcon } from "@/components/icons/circular-progress";
import { useCollectiveFund } from "@/hooks/use-collective-fund";
import { useCollectiveMemberPosition } from "@/hooks/use-collective-member-position";
import { Body, useConnectedUser } from "@breadcoop/ui";
import FundHeader from "./header";
import FundOverview from "./fund-overview";
import MemberPosition from "./member-position";
import DonatePanel from "./donate-panel";
import Proposals from "./proposals";
import NewProposal from "./new-proposal";
import FundMembers from "./members";

const PageContent = ({ id }: { id: string }) => {
  return (
    <FeatureGate feature="collectiveFund">
      <CollectivePageContent id={id} />
    </FeatureGate>
  );
};

const CollectivePageContent = ({ id }: { id: string }) => {
  const fundId = BigInt(id);
  const { user } = useConnectedUser();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;
  const fundResult = useCollectiveFund(fundId);
  const { position } = useCollectiveMemberPosition(fundId, address);
  const isMember = position?.isMember ?? false;

  return (
    <>
      <FundHeader fund={fundResult.data} id={id} isMember={isMember} />
      {fundResult.data ? (
        <div className="*:mb-4 last:mb-0 md:mb-6 md:last:mb-0">
          <FundOverview fundId={fundId} fund={fundResult.data} />
          {isMember ? (
            <MemberPosition fundId={fundId} fund={fundResult.data} />
          ) : (
            <DonatePanel fundId={fundId} fund={fundResult.data} />
          )}
          <Proposals fundId={fundId} fund={fundResult.data} member={address} />
          {isMember && <NewProposal fundId={fundId} />}
          <FundMembers
            id={id}
            fund={fundResult.data}
            member={address}
            isMember={isMember}
          />
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
