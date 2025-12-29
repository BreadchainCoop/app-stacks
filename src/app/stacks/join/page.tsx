"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { Address } from "viem";
import {
	Accordion,
	AccordionHeader,
	AccordionContent,
	AccordionItem,
} from "@/components/accordion";
import { Body, Heading1, LoginButton } from "@breadcoop/ui";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "../../../../lib/constants";
import { savingCirclesAbi } from "../../../../lib/abis/saving-circles";
import { CheckIcon, ConfettiIcon } from "@phosphor-icons/react";
import Alert from "@/components/alert";
import LocalLiftedButton from "@/components/lifted-button";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "@/app/loading";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/components/providers/web3";

export default function Page() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const circleId = searchParams.get("circleId")!;
	const parsedId = BigInt(circleId);
	const nonce = searchParams.get("nonce");
	const signature = searchParams.get("signature");

	const [redeeming, setRedeeming] = useState(false);

	const { address, isConnected } = useAccount();
	const { writeContractAsync } = useWriteContract();

	const circleResult = useReadContract({
		abi: savingCirclesAbi,
		address: SAVING_CIRCLES_CONTRACT_ADDRESS,
		functionName: "getCircle",
		args: [parsedId],
	});

	let { data: isMember, error: isMemberError } = useReadContract({
		abi: savingCirclesAbi,
		address: SAVING_CIRCLES_CONTRACT_ADDRESS,
		functionName: "isMember",
		args: [parsedId, address as Address],
		query: { enabled: Boolean(address) },
	});

	const redeemInvite = async () => {
		if (!address || !isConnected) return alert("Connect your wallet");

		if (!nonce || !signature) {
			alert("Invalid Data");
			return console.log("__ INVALID DATA __", { nonce, signature });
		}

		try {
			setRedeeming(true);
			const hash = await writeContractAsync({
				address: SAVING_CIRCLES_CONTRACT_ADDRESS,
				abi: savingCirclesAbi,
				functionName: "redeemInvite",
				args: [parsedId, BigInt(nonce), signature as Address],
			});

			await waitForTransactionReceipt(wagmiConfig, { hash });

			alert("Invitation Accepted!");
			// TODO: Redirect to the stack page using its ID.
			router.push("/");
		} catch (error) {
			console.log("__ ERROR REDEEM __", error);
		} finally {
			setRedeeming(false);
		}
	};

	useEffect(() => {
		// document.body.classList.add("bg-paper-0!");
		document.querySelector("main")?.classList.remove("page-layout");

		return () => {
			// document.body.classList.remove("bg-paper-0!");
			document.querySelector("main")?.classList.add("page-layout");
		};
	}, []);

	return (
		<div className="*:mb-6 last:mb-0 page-layout py-6 w-full max-w-142 mx-auto sm:shadow-[0px_4px_12px_0px_#1B201A26]">
			<div className="flex flex-col text-center items-center justify-center gap-3">
				<ConfettiIcon className="size-20 fill-primary-blue" />
				<Heading1 className="text-2xl leading-6">
					You are invited!
				</Heading1>
				<Body className="">
					Accept this invite to join this stacks saving journey.
				</Body>
			</div>

			{circleResult.data ? (
				<>
					<div className="border-t border-blue-0 pt-6">
						<Body className="text-center mb-6">
							You have been invited to join “Summer trip 2026”
							Stacks saving journey.
						</Body>

						<Accordion defaultValue="details">
							<AccordionItem
								value="details"
								className="border-blue-0! bg-transparent!"
							>
								<AccordionHeader>
									Stacks details
								</AccordionHeader>
								<AccordionContent>
									<div className="">
										<RowDetail
											label="Group name"
											body="Name"
										/>
										<RowDetail
											label="Stacks group ID"
											body={circleId}
										/>
										<RowDetail
											label="Duration"
											body="Duration"
										/>
										<RowDetail
											label="Est. Deposit amount"
											body={`20 BREAD`}
										/>
										<RowDetail
											label="Stack goal"
											body={`30 BREAD`}
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
						description="Each Invite is unique and can only be accepted once."
					/>

					{address && isConnected ? (
						<>
							{typeof isMember === "boolean" ? (
								<>
									{isMember ? (
										<Body className="text-system-green text-center">
											You are a member of this circle
											already!
										</Body>
									) : (
										<LocalLiftedButton
											onClick={redeemInvite}
											width="full"
											leftIcon={
												redeeming ? undefined : (
													<CheckIcon size={24} />
												)
											}
											className="bg-system-green"
										>
											{redeeming ? (
												<Loading />
											) : (
												"Accept invite"
											)}
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
						<LoginButton app="stacks" status="NOT_CONNECTED" />
					)}

					<Body className="">
						Note: You can also access your member invite links
						through your Stacks details page.
					</Body>
				</>
			) : circleResult.error ? (
				<Body className="text-system-red">Unable to get circle</Body>
			) : (
				<div className="flex items-center justify-center">
					<Loading />
				</div>
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
