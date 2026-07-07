"use client";

import Loading from "@/app/loading";
import Alert from "@/components/alert";
import { FeatureGate } from "@/components/feature-gate";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { Body, Heading1 } from "@breadcoop/ui";
import { ConfettiIcon } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useReadContract } from "wagmi";
import AcceptInvite from "./accept-invite";
import InviteDetails from "./invite-details";
import AscaInvite from "./asca-invite";
import GoalInvite from "./goal-invite";
import CollectiveInvite from "./collective-invite";

export default function PageContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  useEffect(() => {
    document.querySelector("main")?.classList.remove("page-layout");

    return () => {
      document.querySelector("main")?.classList.add("page-layout");
    };
  }, []);

  // Invite URLs carry type=<stack type>; ROSCA invites stay bare for
  // back-compat. Each type reads and redeems against its own contract.
  if (type === "asca") {
    return (
      <FeatureGate feature="asca">
        <AscaInvite />
      </FeatureGate>
    );
  }

  if (type === "goal") {
    return (
      <FeatureGate feature="goalSavings">
        <GoalInvite />
      </FeatureGate>
    );
  }

  if (type === "collective") {
    return (
      <FeatureGate feature="collectiveFund">
        <CollectiveInvite />
      </FeatureGate>
    );
  }

  return <RoscaInvite />;
}

function RoscaInvite() {
  const searchParams = useSearchParams();
  const parsedId = BigInt(searchParams.get("circleId") || "");

  const circleResult = useReadContract({
    abi: savingCirclesAbi,
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    functionName: "getCircle",
    args: [parsedId],
    chainId: getDefaultChainId(),
  });

  return (
    <div className="*:mb-6 last:mb-0 page-layout py-6 w-full max-w-142 mx-auto card-shadow-bg">
      <div className="flex flex-col text-center items-center justify-center gap-3">
        <ConfettiIcon className="size-20 fill-primary-blue" />
        <Heading1 className="text-2xl leading-6">You are invited!</Heading1>
        <Body className="">
          Accept this invite to join this stacks saving journey.
        </Body>
      </div>

      {circleResult.data ? (
        <>
          <InviteDetails depositAmount={circleResult.data.depositAmount} />

          <Alert
            closeAble={false}
            variant="warning"
            title="IMPORTANT: This invite can only be accepted once!"
            description="Each invite is unique and can only be accepted once."
          />

          <AcceptInvite />

          <Body>
            Note: You can also access your member invite links through your
            Stacks details page.
          </Body>
        </>
      ) : circleResult.error ? (
        <Body className="text-system-red text-center">
          Unable to load circle details. Please try again.
        </Body>
      ) : (
        <div className="flex items-center justify-center">
          <Loading />
        </div>
      )}
    </div>
  );
}
