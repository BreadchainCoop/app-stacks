"use client";

import {
	Accordion,
	AccordionHeader,
	AccordionContent,
	AccordionItem,
} from "@/components/accordion";
import { Body, Chip } from "@breadcoop/ui";
import { CopyIcon } from "@phosphor-icons/react";

function DepositRow({ label, body }: { label: string; body: string }) {
	return (
		<div className="flex items-center justify-between mb-2.5 last:mb-0">
			<Body>{label}</Body>
			<Body bold>{body}</Body>
		</div>
	);
}

function PendingInvite() {
	return (
		<Body className="text-sm *:border *:border-surface-grey *:py-3 flex items-center justify-start bg-green-600">
			<span className="border-r-0! bg-paper-0 px-2 shrink-0">
				Invite link
			</span>
			<span className="bg-paper-1 px-4 flex-2 truncate">
				https://stacks.bread.coop/stacks-dt564
			</span>
			<button className="border-x-0! border-transparent! px-3 flex items-center justify-center gap-2.5 text-paper-main bg-primary-blue shrink-0">
				<CopyIcon size={16} />
				<span>Copy</span>
			</button>
		</Body>
	);
}

const MembersInfo = () => {
	return (
		<div>
			<Accordion>
				<AccordionItem value="owner">
					<AccordionHeader>
						<div className="flex items-center justify-start gap-4">
							<Body bold>0x467hd...</Body>
							<Chip className="font-bold text-blue-1 bg-paper-main border-current text-xs">
								Group owner
							</Chip>
						</div>
					</AccordionHeader>
					<AccordionContent>
						<div>
							<DepositRow label="Next deposit" body="In 3 days" />
							<DepositRow
								label="Last deposit"
								body="12 days ago"
							/>
							<DepositRow
								label="Total deposits"
								body="4,400 BREAD"
							/>
							<DepositRow label="Joined" body="13 oct, 2025" />
						</div>
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="member">
					<AccordionHeader>
						<div className="flex items-center justify-start gap-x-4 gap-y-1 flex-wrap">
							<Body bold>Ron.breadcoop.eth</Body>
						</div>
					</AccordionHeader>
					<AccordionContent>
						<div>
							<DepositRow label="Next deposit" body="In 3 days" />
							<DepositRow
								label="Last deposit"
								body="12 days ago"
							/>
							<DepositRow
								label="Total deposits"
								body="4,400 BREAD"
							/>
							<DepositRow label="Joined" body="13 oct, 2025" />
						</div>
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="pending-invite-1">
					<AccordionHeader>
						<div className="flex items-center justify-start gap-x-4 gap-y-1 flex-wrap">
							<Body bold className="text-system-warning">
								Pending Invite
							</Body>
						</div>
					</AccordionHeader>
					<AccordionContent>
						<PendingInvite />
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
};

export default MembersInfo;
