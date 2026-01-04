"use client";

import {
	Accordion,
	AccordionHeader,
	AccordionContent,
	AccordionItem,
} from "@/components/accordion";
import PendingInviteLink from "@/components/pending-invite-link";
import { useCircleMembersWithBalances } from "@/hooks/use-circle-members";
import { Body, Chip } from "@breadcoop/ui";
import { Address, formatEther } from "viem";
import { useEnsName } from "wagmi";

function DepositRow({ label, body }: { label: string; body: string }) {
	return (
		<div className="flex items-center justify-between mb-2.5 last:mb-0">
			<Body>{label}</Body>
			<Body bold>{body}</Body>
		</div>
	);
}

const MembersInfo = ({
	owner,
	info,
	id,
}: {
	owner: Address;
	id: string;
	info: ReturnType<typeof useCircleMembersWithBalances>;
}) => {
	return (
		<div>
			<Accordion>
				{info.members.map((member, index) => {
					const totalDeposits = formatEther(
						info.memberBalances?.balances[index] || BigInt(0)
					);

					return (
						<AccordionItem key={member} value={member}>
							<AccordionHeader>
								<div className="flex items-center justify-start gap-4">
									{member === owner ? (
										<>
											<Body bold>
												{/* {owner.slice(0, 7)}... */}
												<MemberEnsName
													address={owner}
												/>
											</Body>
											<Chip className="font-bold text-blue-1 bg-paper-main border-current text-xs">
												Group owner
											</Chip>
										</>
									) : (
										<Body bold>
											<MemberEnsName address={member} />
										</Body>
									)}
								</div>
							</AccordionHeader>
							<AccordionContent>
								<div>
									<DepositRow
										label="Next deposit"
										body="In 3 days"
									/>
									<DepositRow
										label="Last deposit"
										body="12 days ago"
									/>
									<DepositRow
										label="Total deposits"
										body={`${totalDeposits} BREAD`}
									/>
									<DepositRow
										label="Joined"
										body="13 oct, 2025"
									/>
								</div>
							</AccordionContent>
						</AccordionItem>
					);
				})}
				<AccordionItem value="pending-invite-1">
					<AccordionHeader>
						<div className="flex items-center justify-start gap-x-4 gap-y-1 flex-wrap">
							<Body bold className="text-system-warning">
								Pending Invite
							</Body>
						</div>
					</AccordionHeader>
					<AccordionContent>
						<PendingInviteLink link="https://stacks.bread.coop/stacks-dt564" />
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);

	// return (
	// 	<div>
	// 		<Accordion>
	// 			<AccordionItem value="owner">
	// 				<AccordionHeader>
	// 					<div className="flex items-center justify-start gap-4">
	// 						<Body bold>{owner.slice(0, 7)}...</Body>
	// 						<Chip className="font-bold text-blue-1 bg-paper-main border-current text-xs">
	// 							Group owner
	// 						</Chip>
	// 					</div>
	// 				</AccordionHeader>
	// 				<AccordionContent>
	// 					<div>
	// 						<DepositRow label="Next deposit" body="In 3 days" />
	// 						<DepositRow
	// 							label="Last deposit"
	// 							body="12 days ago"
	// 						/>
	// 						<DepositRow
	// 							label="Total deposits"
	// 							body="4,400 BREAD"
	// 						/>
	// 						<DepositRow label="Joined" body="13 oct, 2025" />
	// 					</div>
	// 				</AccordionContent>
	// 			</AccordionItem>

	// 			<AccordionItem value="member">
	// 				<AccordionHeader>
	// 					<div className="flex items-center justify-start gap-x-4 gap-y-1 flex-wrap">
	// 						<Body bold>Ron.breadcoop.eth</Body>
	// 					</div>
	// 				</AccordionHeader>
	// 				<AccordionContent>
	// 					<div>
	// 						<DepositRow label="Next deposit" body="In 3 days" />
	// 						<DepositRow
	// 							label="Last deposit"
	// 							body="12 days ago"
	// 						/>
	// 						<DepositRow
	// 							label="Total deposits"
	// 							body="4,400 BREAD"
	// 						/>
	// 						<DepositRow label="Joined" body="13 oct, 2025" />
	// 					</div>
	// 				</AccordionContent>
	// 			</AccordionItem>

	// 			<AccordionItem value="pending-invite-1">
	// 				<AccordionHeader>
	// 					<div className="flex items-center justify-start gap-x-4 gap-y-1 flex-wrap">
	// 						<Body bold className="text-system-warning">
	// 							Pending Invite
	// 						</Body>
	// 					</div>
	// 				</AccordionHeader>
	// 				<AccordionContent>
	// 					<PendingInviteLink link="https://stacks.bread.coop/stacks-dt564" />
	// 				</AccordionContent>
	// 			</AccordionItem>
	// 		</Accordion>
	// 	</div>
	// );
};

function MemberEnsName({ address }: { address: Address }) {
	const { data } = useEnsName({ address });

	return <>{data || address}</>;
}

export default MembersInfo;
