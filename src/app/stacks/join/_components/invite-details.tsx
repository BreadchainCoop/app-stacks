"use client";

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "@/components/accordion";
import Loading from "@/app/loading";
import { useCirclePreview } from "@/hooks/use-circle-preview";
import { useStackSupabase } from "@/hooks/use-stack-supabase";
import { getIntervalBySeconds } from "@/utils/deposit-interval";
import { Body, formatBalance } from "@breadcoop/ui";
import { formatEther } from "viem";

type InviteDetailsProps = {
  circleId: string;
};

export default function InviteDetails({ circleId }: InviteDetailsProps) {
  const { data: stackMetadata, isLoading: isLoadingMetadata } =
    useStackSupabase(circleId);
  const { data: circle, isLoading: isLoadingCircle } =
    useCirclePreview(circleId);

  if (isLoadingMetadata || isLoadingCircle) {
    return (
      <div className="flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!stackMetadata || !circle) {
    return (
      <Body className="text-system-red text-center">
        This stack does not exist.
      </Body>
    );
  }

  const circleName = stackMetadata.stackname;
  const members = stackMetadata.expected_members;
  const duration =
    getIntervalBySeconds(Number(circle.depositInterval))?.label ?? "-";
  const deposit = formatEther(circle.depositAmount);

  return (
    <div className="border-t border-blue-0 pt-6">
      <Body className="text-center mb-6">
        You have been invited to join &quot;{circleName}&quot; Stacks saving
        journey.
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
              <RowDetail label="Duration" body={duration} />
              <RowDetail
                label="Est. Deposit amount"
                body={`$${formatBalance(+deposit)}`}
              />
              <RowDetail
                label="Stack goal"
                body={`$${formatBalance(members ** 2 * +deposit, 2)}`}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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
