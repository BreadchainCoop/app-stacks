import { generateMetadata } from "@/utils/metadata";
import { Body, Heading1 } from "@breadcoop/ui";
import { ConfettiIcon } from "@phosphor-icons/react/dist/ssr";
import { JoinPageSettings } from "./_components/settings";
import { CircleParams } from "./_components/interface";
import InviteDetails from "./_components/invite-details";
import RequestToJoin from "./_components/request-to-join";

export const metadata = generateMetadata({
  title: "Join a Stack - Bread Cooperative",
  description: "Connect with your friends.",
  url: "/stacks/join",
});

export default async function Page(props: {
  searchParams: Promise<CircleParams>;
}) {
  const searchParams = await props.searchParams;

  // A hand-edited/corrupted invite link shouldn't crash the whole page —
  // InviteDetails/RequestToJoin below handle a bad or missing circleId with
  // their own "invalid link" messaging.
  let circleId: bigint | undefined;
  try {
    circleId = searchParams.circleId
      ? BigInt(searchParams.circleId)
      : undefined;
  } catch {
    circleId = undefined;
  }

  return (
    <>
      <JoinPageSettings circleId={circleId} />
      <div className="*:mb-6 last:mb-0 page-layout py-6 w-full max-w-142 mx-auto card-shadow-bg">
        <div className="flex flex-col text-center items-center justify-center gap-3">
          <ConfettiIcon className="size-20 fill-primary-blue" />
          <Heading1 className="text-2xl leading-6">You are invited!</Heading1>
          <Body className="">
            Accept this invite to join this stacks saving journey.
          </Body>
        </div>

        <InviteDetails circleId={searchParams.circleId} />

        <RequestToJoin circleId={searchParams.circleId} />

        <Body>
          Note: You can also find this Stack&apos;s invite link on its details
          page.
        </Body>
      </div>
    </>
  );
}
