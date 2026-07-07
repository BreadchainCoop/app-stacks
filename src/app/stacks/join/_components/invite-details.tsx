import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "@/components/accordion";
import { Body, formatBalance } from "@breadcoop/ui";
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
                body={`$${formatBalance(Number(members) ** 2 * Number(deposit), 2)}`}
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
