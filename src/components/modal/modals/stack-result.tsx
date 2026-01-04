import { ArrowRightIcon, SealCheckIcon } from "@phosphor-icons/react/ssr";
import { ModalContainer, ModalHeader, ModalStatus } from "../components";
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
import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { type Address, type TypedDataDomain } from "viem";
import { savingCirclesAbi } from "../../../lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "../../../lib/constants";

type InviteLink = {
	nonce: bigint;
	signature: string;
	url: string;
	used: boolean;
};

export const INVITE_DOMAIN_NAME = "StacksInvite";
export const INVITE_DOMAIN_VERSION = "1";

function buildInviteTypedData(
	circleId: bigint,
	nonce: bigint,
	chainId: number,
	contractAddress: Address
) {
	return {
		domain: {
			name: INVITE_DOMAIN_NAME,
			version: INVITE_DOMAIN_VERSION,
			chainId,
			verifyingContract: contractAddress,
		} as TypedDataDomain,
		types: {
			Invite: [
				{ name: "id", type: "uint256" },
				{ name: "nonce", type: "uint256" },
			],
		},
		primaryType: "Invite" as const,
		message: { id: circleId, nonce },
	};
}

function buildInviteUrl(
	baseUrl: string,
	contractAddress: string,
	circleId: string,
	nonce: bigint,
	signature: string
): string {
	const url = new URL(baseUrl);
	url.searchParams.set("contract", contractAddress);
	url.searchParams.set("circleId", circleId);
	url.searchParams.set("nonce", nonce.toString());
	url.searchParams.set("signature", signature);
	return url.toString();
}

export const StackSuccessResultModal = ({
	modalState,
}: {
	modalState: StackInitSuccessModalState;
}) => {
	const { address, chain } = useAccount();
	const publicClient = usePublicClient();
	const { data: walletClient } = useWalletClient();
	const modal = useModal();
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [signingProgress, setSigningProgress] = useState("");
	const [invites, setInvites] = useState<InviteLink[]>([]);

	const generateInvites = async () => {
		if (!address || !publicClient || !chain || !walletClient) return;

		setIsGenerating(true);
		setError(null);

		try {
			const circleId = BigInt(modalState.circle.id);
			const inviteCount = Math.max(1, modalState.circle.members - 1);

			// Generate unique nonces
			const invitePayloads: {
				nonce: bigint;
				typedData: ReturnType<typeof buildInviteTypedData>;
			}[] = [];
			let candidate = BigInt(Date.now());

			while (invitePayloads.length < inviteCount) {
				const alreadyUsed = await publicClient.readContract({
					address: SAVING_CIRCLES_CONTRACT_ADDRESS,
					abi: savingCirclesAbi,
					functionName: "usedNonces",
					args: [circleId, candidate],
				});

				if (!alreadyUsed) {
					const typedData = buildInviteTypedData(
						circleId,
						candidate,
						chain.id,
						SAVING_CIRCLES_CONTRACT_ADDRESS
					);
					invitePayloads.push({ nonce: candidate, typedData });
				}
				candidate += BigInt(1);
			}

			// Sign each invite
			const signedInvites: InviteLink[] = [];
			// const baseUrl =
			// 	typeof window !== "undefined"
			// 		? `${window.location.origin}/stacks/join`
			// 		: "https://stacks.bread.coop/stacks/join";

			const baseUrl = `${window.location.origin}/stacks/join`;

			for (let i = 0; i < invitePayloads.length; i++) {
				setSigningProgress(
					`Signing invite ${i + 1} of ${invitePayloads.length}...`
				);
				const { nonce, typedData } = invitePayloads[i];

				const signature = await walletClient.signTypedData({
					account: address,
					domain: typedData.domain,
					types: typedData.types,
					primaryType: typedData.primaryType,
					message: typedData.message,
				});

				const url = buildInviteUrl(
					baseUrl,
					SAVING_CIRCLES_CONTRACT_ADDRESS,
					modalState.circle.id,
					nonce,
					signature
				);

				signedInvites.push({ nonce, signature, url, used: false });
			}

			setSigningProgress("");
			setInvites(signedInvites);
		} catch (error) {

		} finally {
			setIsGenerating(false);
		}
	};

	useEffect(() => {
		if (invites.length === 0 && !isGenerating && !error) {
			generateInvites();
		}
	}, [generateInvites, invites.length, isGenerating, error]);

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
						<Body>Pending: {modalState.circle.members - 1}</Body>
						<Body bold>Invite accepted: 0</Body>
					</div>

					{isGenerating && (
						<div className="p-4 bg-primary-blue/10 rounded-lg mb-2">
							{signingProgress && (
								<Body className="text-primary-blue">
									{signingProgress}
								</Body>
							)}
						</div>
					)}

					{error && (
						<div className="p-4 bg-system-warning/10 rounded-lg mb-2">
							<Body className="text-system-warning">
								Error: {error}
							</Body>
							<button
								onClick={generateInvites}
								className="mt-2 text-sm underline"
							>
								Retry
							</button>
						</div>
					)}

					<div className="*:mb-2 *:last:mb-0">
						{invites.length > 0
							? invites.map((invite, i) => (
									<PendingInviteLink
										key={invite.nonce.toString()}
										link={invite.url}
										label={`0${i + 1}`}
									/>
							  ))
							: !isGenerating && !error
							? Array.from(
									{ length: modalState.circle.members },
									(_, i) => i + 1
							  ).map((m) => (
									<PendingInviteLink
										key={m}
										link=""
										label={`0${m}`}
									/>
							  ))
							: null}
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

export const StackFailedResultModal = ({
	modalState,
}: {
	modalState: StackInitFailedModalState;
}) => {
	return (
		<ModalContainer status="error">
			<ModalHeader title="Stack Creation Failed"></ModalHeader>
			<ModalStatus status="error" msg="Unable to create stack" />
		</ModalContainer>
	);
};
