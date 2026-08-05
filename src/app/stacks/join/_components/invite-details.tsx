import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "@/components/accordion";
import { formatAmount } from "@/utils/format-amount";
import { Body } from "@breadcoop/ui";
import { CircleParams } from "./interface";

type InviteDetailsProps = Pick<
  CircleParams,
  "circleId" | "name" | "duration" | "members" | "deposit"
>;

export default function InviteDetails({
  name: circleName,
  circleId,
  duration,
  members,
  deposit,
}: InviteDetailsProps) {
  // Invites generated before the deposit was written raw carry a comma-grouped
  // amount (e.g. "90,999,999.00"), which Number() alone reads as NaN.
  const depositAmount = Number((deposit ?? "").replace(/,/g, ""));

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
                body={`$${formatAmount(depositAmount)}`}
              />
              <RowDetail
                label="Stack goal"
                body={`$${formatAmount(Number(members) ** 2 * depositAmount, 2)}`}
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
