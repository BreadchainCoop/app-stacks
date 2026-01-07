import { Body } from "@breadcoop/ui";
import { CopyIcon } from "@phosphor-icons/react/ssr";
import { cn } from "../lib/utils";
import CopyButton from "./copy-button";

const PendingInviteLink = ({
	link,
	label = "Invite link",
	className,
}: {
	link: string;
	label?: string;
	className?: string;
}) => {
	return (
		<Body
			className={cn(
				"text-sm *:border *:border-surface-grey *:py-3 flex items-center justify-start bg-green-600",
				className
			)}
		>
			<span className="border-r-0! bg-paper-0 px-2 shrink-0 text-surface-grey">
				{label}
			</span>
			<span className="bg-paper-1 px-4 flex-2 truncate">{link}</span>
			<CopyButton
				textToCopy={link}
				checkedIconSize={16}
				varaint="icon-text"
				className="border-x-0! border-transparent! px-3 flex items-center justify-center gap-2.5 text-paper-main bg-primary-blue shrink-0"
			>
				<CopyIcon size={16} />
				<span>Copy</span>
			</CopyButton>
		</Body>
	);
};

export default PendingInviteLink;
