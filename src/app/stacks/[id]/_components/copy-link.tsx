"use client";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { clientEnv } from "@/lib/env";
import { shortenUrl } from "@/utils/shorten";
import { LiftedButton } from "@breadcoop/ui";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export const CopyStackLink = () => {
	const [textToCopy, setTextToCopy] = useState("");
	const { copy, copied } = useCopyToClipboard({ textToCopy, beforeCopy: shortenUrl });

	useEffect(() => {
		setTextToCopy(window.location.href);
	}, []);

	return (
		<LiftedButton
			preset="stroke"
			className={`h-8 border pt-1.5 pb-1.5 px-4 ${copied ? "text-system-green" : ""}`}
			leftIcon={
				copied ? (
					<CheckIcon className="fill-system-green" />
				) : (
					<CopyIcon className="fill-primary-blue" />
				)
			}
			onClick={copy}
		>
			{copied ? "Copied!" : "Copy stack link"}
		</LiftedButton>
	);
};
