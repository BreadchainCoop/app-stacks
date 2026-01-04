import { Body, Heading3 } from "@breadcoop/ui";
import { Icon } from "@phosphor-icons/react";
import {
	EnvelopeOpenIcon,
	HourglassIcon,
	UsersIcon,
} from "@phosphor-icons/react/ssr";
import MembersInfo from "./members-info";
import { Address } from "viem";
import { useCircleMembersWithBalances } from "@/hooks/use-circle-members";

const TopRowInfo = ({
	LIcon,
	title,
	value,
}: {
	LIcon: Icon;
	title: string;
	value: string | number;
}) => {
	return (
		<div className="flex items-center justify-start gap-1.5 p-2">
			<LIcon size={24} className="fill-blue-2" />
			<Body className="text-surface-grey-2">{title}</Body>
			<Body className="text-surface-ink">{value}</Body>
		</div>
	);
};

const StackMembers = ({ owner, id }: { owner: Address; id: string }) => {
	const info = useCircleMembersWithBalances(BigInt(id));

	const totalMembers = info.isLoading ? "-" : info.members.length;

	return (
		<section className="p-4 flex flex-col gap-4">
			<header>
				<Heading3 className="pb-1 leading-[100%] text-2xl">
					Members ({totalMembers})
				</Heading3>
			</header>
			<div className="border-t border-paper-2 pt-4 md:flex md:items-center md:justify-between">
				<TopRowInfo
					LIcon={UsersIcon}
					title="Total Members:"
					value={totalMembers}
				/>
				<TopRowInfo
					LIcon={EnvelopeOpenIcon}
					title="Invited:"
					value={totalMembers}
				/>
				<TopRowInfo
					LIcon={HourglassIcon}
					title="Pending"
					value={totalMembers}
				/>
			</div>
			<MembersInfo owner={owner} id={id} info={info} />
		</section>
	);
};

export default StackMembers;
