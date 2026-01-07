"use client";

import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/utils/copy-to-clipboard";
import { CheckIcon } from "@phosphor-icons/react";
import { ButtonHTMLAttributes, ReactNode, useEffect, useState } from "react";

interface CopyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	varaint: "icon" | "text" | "icon-text";
	textToCopy: string;
  checkedIconSize?: number;
}

const CopyButton = ({
	varaint,
	children,
	textToCopy,
  checkedIconSize = 24,
	...buttonProps
}: CopyButtonProps) => {
	const [copied, setCopied] = useState(false);
	let timer: NodeJS.Timeout | undefined = undefined;

	const copy = async () => {
		await copyToClipboard(textToCopy);

		setCopied(true);

		setTimeout(() => {
			setCopied(false);
		}, 2_000);
	};

	useEffect(() => {
		return () => {
			if (timer) clearTimeout(timer);
		};
	}, []);

	return (
		<button
			{...buttonProps}
			onClick={copy}
			className={cn(
				buttonProps.className,
				copied && varaint !== "icon-text" ? "bg-transparent!" : ""
			)}
		>
			{copied ? (
				<>
					{varaint === "icon" ? (
						<CheckIcon size={checkedIconSize} className="text-blue-2" />
					) : varaint === "text" ? (
						<span className="text-system-green">Copied</span>
					) : (
						<>
							<CheckIcon size={checkedIconSize} className="" />
							<span className="">Copied</span>
						</>
					)}
				</>
			) : (
				<>{children}</>
			)}
		</button>
	);
};

export default CopyButton;
