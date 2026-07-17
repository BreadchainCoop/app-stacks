import Alert from "@/components/alert";
import AcceptInvite from "./accept-invite";
import GeneralInviteFlow from "./general-invite-flow";
import { CircleParams } from "./interface";
import InviteDetails from "./invite-details";

const JoinFlow = ({ searchParams }: { searchParams: CircleParams }) => {
  const hasDirectInvite = Boolean(searchParams.nonce && searchParams.signature);

  if (hasDirectInvite) {
    return (
      <>
        <InviteDetails {...searchParams} />
        <Alert
          closeAble={false}
          variant="warning"
          title="IMPORTANT: This invite can only be accepted once!"
          description="Each invite is unique and can only be accepted once."
        />
        <AcceptInvite
          circleId={searchParams.circleId}
          nonce={searchParams.nonce}
          signature={searchParams.signature}
        />
      </>
    );
  }

  return <GeneralInviteFlow circleId={searchParams.circleId} />;
};

export default JoinFlow;
