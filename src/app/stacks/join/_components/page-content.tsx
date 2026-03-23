"use client";

import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import {
  Accordion,
  AccordionHeader,
  AccordionContent,
  AccordionItem,
} from "@/components/accordion";
import { Body, Heading1, LoginButton, useConnectedUser } from "@breadcoop/ui";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "../../../../lib/constants";
import { savingCirclesAbi } from "../../../../lib/abis/saving-circles";
import { CheckIcon, ConfettiIcon } from "@phosphor-icons/react";
import Alert from "@/components/alert";
import LocalLiftedButton from "@/components/lifted-button";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "@/app/loading";
import { getDefaultChainId } from "@/utils/chain";
import { useSavingCirclesTx } from "@/hooks/use-saving-circles-tx";
import { getAutopayFeatureConfig } from "@/lib/autopay";

const errorMessages: Record<string, string> = {
  InviteAlreadyUsed: "This invitation has already been used.",
  AlreadyMember: "You are already a member of this circle.",
  AlreadyActive: "This circle has already started.",
  NotCommissioned: "This circle does not exist.",
  InvalidSigner: "This invitation link is invalid.",
};

export default function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useConnectedUser();
  const { sendSavingCirclesTx } = useSavingCirclesTx();
  const circleId = searchParams.get("circleId") as string;
  const parsedId = BigInt(circleId || "");
  const nonce = searchParams.get("nonce");
  const signature = searchParams.get("signature");
  const circleName = searchParams.get("name") || "-";
  const members = Number(searchParams.get("members"));
  const interval = searchParams.get("interval") || "";
  const deposit = Number(searchParams.get("deposit"));

  const [redeeming, setRedeeming] = useState(false);
  const [joinedCircle, setJoinedCircle] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const autopayConfig = getAutopayFeatureConfig();

  const circleResult = useReadContract({
    abi: savingCirclesAbi,
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    functionName: "getCircle",
    args: [parsedId],
    chainId: getDefaultChainId(),
  });

  const { data: isMember, error: isMemberError } = useReadContract({
    abi: savingCirclesAbi,
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    functionName: "isMember",
    args: [
      parsedId,
      // @ts-expect-error hook only triggers when address is available
      user.address as `0x${string}`,
    ],
    query: {
      enabled:
        user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN",
    },
    chainId: getDefaultChainId(),
  });

  const { data: isNonceUsed } = useReadContract({
    abi: savingCirclesAbi,
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    functionName: "usedNonces",
    args: [parsedId, BigInt(nonce || "0")],
    query: {
      enabled: !!nonce,
    },
    chainId: getDefaultChainId(),
  });

  const redeemInvite = async () => {
    if (user.status !== "CONNECTED" || !nonce || !signature) return;

    setRedeeming(true);

    try {
      await sendSavingCirclesTx({
        functionName: "redeemInvite",
        args: [parsedId, BigInt(nonce), signature as `0x${string}`],
      });

      let localCircles = JSON.parse(localStorage.getItem("circles") || "{}");
      localCircles = {
        ...localCircles,
        [circleId]: {
          name: circleName,
          totalMembers: members,
        },
      };
      localStorage.setItem("circles", JSON.stringify(localCircles));

      setJoinedCircle({
        id: circleId,
        name: circleName,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const contractError =
        (error?.cause?.data?.errorName as string | undefined) ||
        error?.metaMessages?.[0]?.match(/Error:\s*(\w+)\(\)/)?.[1];

      const shortMessage = error?.shortMessage as string;
      const message =
        errorMessages[contractError ?? ""] ||
        shortMessage ||
        "Failed to redeem invite.";

      alert(message);
    } finally {
      setRedeeming(false);
    }
  };

  useEffect(() => {
    document.querySelector("main")?.classList.remove("page-layout");

    return () => {
      document.querySelector("main")?.classList.add("page-layout");
    };
  }, []);

  return (
    <div className="*:mb-6 last:mb-0 page-layout py-6 w-full max-w-142 mx-auto sm:shadow-[0px_4px_12px_0px_#1B201A26]">
      {joinedCircle ? (
        <>
          <div className="flex flex-col text-center items-center justify-center gap-3">
            <ConfettiIcon className="size-20 fill-primary-blue" />
            <Heading1 className="text-2xl leading-6">
              You joined the circle
            </Heading1>
            <Body>
              You are now a member of &quot;{joinedCircle.name}&quot;.
            </Body>
          </div>

          <section className="border-t border-blue-0 pt-6">
            {autopayConfig.isConfigured ? (
              <>
                <Body className="mb-4">
                  Optional autopay helps avoid missed deposits. It only applies
                  to your own contribution path for this circle, and you can
                  skip setup for now.
                </Body>

                <div className="flex flex-col gap-3">
                  <LocalLiftedButton
                    width="full"
                    onClick={() =>
                      router.push(`/stacks/${joinedCircle.id}?autopay=setup`)
                    }
                  >
                    Enable autopay
                  </LocalLiftedButton>
                  <LocalLiftedButton
                    width="full"
                    preset="secondary"
                    onClick={() => router.push(`/stacks/${joinedCircle.id}`)}
                  >
                    Skip for now
                  </LocalLiftedButton>
                </div>
              </>
            ) : (
              <>
                <Body className="mb-4">
                  Your invite is redeemed and your stack membership is active.
                  Autopay is not configured on this deployment, so you can
                  continue directly to the circle.
                </Body>
                <LocalLiftedButton
                  width="full"
                  onClick={() => router.push(`/stacks/${joinedCircle.id}`)}
                >
                  Continue to circle
                </LocalLiftedButton>
              </>
            )}
          </section>
        </>
      ) : (
        <>
          <div className="flex flex-col text-center items-center justify-center gap-3">
            <ConfettiIcon className="size-20 fill-primary-blue" />
            <Heading1 className="text-2xl leading-6">You are invited!</Heading1>
            <Body className="">
              Accept this invite to join this stacks saving journey.
            </Body>
          </div>

          {circleResult.data ? (
            <>
              <div className="border-t border-blue-0 pt-6">
                <Body className="text-center mb-6">
                  You have been invited to join &quot;{circleName}&quot; Stacks
                  saving journey.
                </Body>

                <Accordion defaultValue="details">
                  <AccordionItem
                    value="details"
                    className="border-blue-0! bg-transparent!"
                  >
                    <AccordionHeader>Stacks details</AccordionHeader>
                    <AccordionContent>
                      <div className="">
                        <RowDetail label="Group name" body={circleName} />
                        <RowDetail label="Stacks group ID" body={circleId} />
                        <RowDetail
                          label="Duration"
                          body={`${members} rounds`}
                        />
                        <RowDetail
                          label="Members deposit every"
                          body={interval || "-"}
                        />
                        <RowDetail
                          label="Est. Deposit amount"
                          body={`${formatEther(
                            circleResult.data.depositAmount
                          )} BREAD`}
                        />
                        <RowDetail
                          label="Stack goal"
                          body={`${members ** 2 * deposit} BREAD`}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <Alert
                closeAble={false}
                variant="warning"
                title="IMPORTANT: This invite can only be accepted once!"
                description="Each invite is unique and can only be accepted once."
              />

              {user.status === "CONNECTED" ? (
                <>
                  {typeof isMember === "boolean" ? (
                    <>
                      {isMember ? (
                        <Body className="text-system-green text-center">
                          You are already a member of this circle!
                        </Body>
                      ) : isNonceUsed ? (
                        <LocalLiftedButton
                          width="full"
                          disabled
                          preset="positive"
                          className="text-white"
                        >
                          Invitation already used
                        </LocalLiftedButton>
                      ) : (
                        <LocalLiftedButton
                          onClick={redeemInvite}
                          width="full"
                          leftIcon={
                            redeeming ? undefined : <CheckIcon size={24} />
                          }
                          className="bg-system-green"
                          disabled={redeeming}
                        >
                          {redeeming ? <Loading /> : "Accept invite"}
                        </LocalLiftedButton>
                      )}
                    </>
                  ) : isMemberError ? (
                    <Body className="text-system-red text-center">
                      Unable to get data! Please refresh the page!
                    </Body>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Loading />
                    </div>
                  )}
                </>
              ) : (
                <LoginButton app="stacks" status={user.status} />
              )}

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
        </>
      )}
    </div>
  );
}

function RowDetail({ label, body }: { label: string; body: string | number }) {
  return (
    <div className="flex items-center justify-between mb-2.5 last:mb-0">
      <Body className="text-surface-grey">{label}</Body>
      <Body bold className="text-surface-ink">
        {body}
      </Body>
    </div>
  );
}
