"use client";

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "@/components/accordion";
import { Body, formatBalance } from "@breadcoop/ui";
import { useSearchParams } from "next/navigation";
import { formatEther } from "viem";

export default function InviteDetails({
  depositAmount,
}: {
  depositAmount: bigint;
}) {
  const searchParams = useSearchParams();
  const circleId = searchParams.get("circleId") as string;
  const circleName = searchParams.get("name") || "-";
  const duration = searchParams.get("duration") || "";
  const members = Number(searchParams.get("members"));
  const deposit = Number(searchParams.get("deposit"));

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
                body={`${formatEther(depositAmount)} BREAD`}
              />
              <RowDetail
                label="Stack goal"
                body={`${formatBalance(members ** 2 * deposit, 2)} BREAD`}
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
