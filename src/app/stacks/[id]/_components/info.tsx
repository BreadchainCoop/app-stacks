import { formatAddress } from "@/utils/address";
import { Body } from "@breadcoop/ui";
import { ArrowUpRightIcon, CopyIcon } from "@phosphor-icons/react/ssr";
import { ReactNode } from "react";
import { Address } from "viem";

const StackInfoRow = ({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) => {
	return (
		<div className="bg-paper-1 py-2 px-6 flex items-center justify-between mb-[0.6875rem] last:mb-0">
			<Body>{label}</Body>
			<div>{children}</div>
		</div>
	);
};

const StackInfo = ({ owner }: { owner: Address }) => {
	return (
		<div className="mt-6.5">
			<StackInfoRow label="Contract:">
				<a
					href="http://"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center justify-end gap-1"
				>
					0x1234...5678
					<ArrowUpRightIcon size={24} className="fill-blue-2" />
				</a>
			</StackInfoRow>
			<StackInfoRow label="Created by:">
				<button className="flex items-center justify-end gap-1">
					{formatAddress(owner)}
					<CopyIcon size={24} className="fill-blue-2" />
				</button>
			</StackInfoRow>
		</div>
	);
};

export default StackInfo;
