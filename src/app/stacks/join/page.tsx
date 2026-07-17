import { generateMetadata } from "@/utils/metadata";
import { Body, Heading1 } from "@breadcoop/ui";
import { ConfettiIcon } from "@phosphor-icons/react/dist/ssr";
import { JoinPageSettings } from "./_components/settings";
import { CircleParams } from "./_components/interface";
import JoinFlow from "./_components/join-flow";

export const metadata = generateMetadata({
  title: "Join a Stack - Bread Cooperative",
  description: "Connect with your friends.",
  url: "/stacks/join",
});

export default async function Page(props: {
  searchParams: Promise<CircleParams>;
}) {
  const searchParams = await props.searchParams;
  const circleId = searchParams.circleId
    ? BigInt(searchParams.circleId)
    : undefined;

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

        <JoinFlow searchParams={searchParams} />

        <Body>
          Note: You can also access your member invite links through your Stacks
          details page.
        </Body>
      </div>
    </>
  );
}
