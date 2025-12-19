import { ArrowRightIcon, SealCheckIcon } from "@phosphor-icons/react/ssr";
import { ModalContainer } from "../components";
import {
	StackInitFailedModalState,
	StackInitSuccessModalState,
	useModal,
} from "../context";
import { Body, Heading2, Heading3 } from "@breadcoop/ui";
import PendingInviteLink from "@/components/pending-invite-link";
import {
	Accordion,
	AccordionContent,
	AccordionHeader,
	AccordionItem,
} from "@/components/accordion";
import Link from "next/link";
import LocalLiftedButton from "@/components/lifted-button";

export const StackSuccessResultModal = ({
	modalState,
}: {
	modalState: StackInitSuccessModalState;
}) => {
	const modal = useModal();
	return (
		<ModalContainer className="max-w-142!">
			<div className="flex flex-col gap-3 items-center justify-center">
				<SealCheckIcon size={80} className="fill-system-green" />
				<Heading2 className="text-2xl leading-6">
					“{modalState.circle.name}”
				</Heading2>
				<Body className="text-surface-ink">Stacks group created!</Body>
			</div>
			<div className="*:mb-4 *:last:mb-0 border-t border-primary-blue pt-6">
				<Body>
					Your Stacks has 1 member (you). Invite others with a link.
					To deposit, it needs 2 or more members.
				</Body>
				<section>
					<Heading3 className="mb-2 text-2xl leading-[100%]">
						Member invite links
					</Heading3>
					<div className="flex items-center justify-between mb-2">
						<Body>Pending: {modalState.circle.members}</Body>
						<Body bold>Invite accepted: 0</Body>
					</div>
					<div className="*:mb-2 *:last:mb-0">
						{Array.from(
							{ length: modalState.circle.members },
							(_, i) => i + 1
						).map((m) => (
							<PendingInviteLink
								key={m}
								link="https://stacks.bread.coop/stacks-dt564"
								label={`0${m}`}
							/>
						))}
					</div>
					<Body className="text-system-warning mt-4">
						<span className="font-bold">Reminder: </span>
						<span>
							Each Invite is unique and can only be accepted once.
						</span>
					</Body>
				</section>
				{/* Stack details */}
				<Accordion>
					<AccordionItem value="detail">
						<AccordionHeader>Stacks details</AccordionHeader>
						<AccordionContent>
							<div>
								<RowDetail
									label="Group name"
									body={modalState.circle.name}
								/>
								<RowDetail
									label="Stacks group ID"
									body={modalState.circle.id}
								/>
								<RowDetail
									label="Duration"
									body={modalState.circle.duration}
								/>
								<RowDetail
									label="Est. Deposit amount"
									body={`${modalState.circle.deposit} BREAD`}
								/>
								<RowDetail
									label="Stack goal"
									body={`${modalState.circle.total} BREAD`}
								/>
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
			<Link
				href={`/stacks/${modalState.circle.id}`}
				className="lifted-button-container block"
				onClick={() => modal.setModal(null)}
			>
				<LocalLiftedButton rightIcon={<ArrowRightIcon size={24} />}>
					Visit stacks detail page
				</LocalLiftedButton>
			</Link>
			<Body className="text-surface-grey-2">
				Note: You can also access your member invite links through your
				Stacks details page.
			</Body>
		</ModalContainer>
	);
};

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
