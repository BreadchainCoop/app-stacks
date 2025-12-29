"use client";

import { Body } from "@breadcoop/ui";
import { Icon, ThumbsUpIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";

type Varaint = "success" | "warning";

interface AlertProps {
	variant: Varaint;
	title: string;
	description: string;
	className?: string;
	closeAble?: boolean;
}

const configs: Record<Varaint, { cont: string; body: string; Icon: Icon }> = {
	success: {
		cont: "bg-[#EBF6E5] border-system-green",
		body: "text-system-green",
		Icon: ThumbsUpIcon,
	},
	warning: {
		cont: "bg-[#FFEDD0] border-system-warning",
		body: "text-system-warning",
		Icon: WarningIcon,
	},
};

const Alert = ({
	title,
	description,
	variant,
	className,
	closeAble = true,
}: AlertProps) => {
	const [show, setShow] = useState(true);

	if (!show) return null;

	const config = configs[variant];

	return (
		<div
			className={`border-l-2 px-6 py-3 flex items-start justify-between ${config.cont}`}
		>
			<div>
				<div
					className={`flex items-center justify-start gap-1.5 mb-3 ${config.body}`}
				>
					<config.Icon size={16} className="shrink-0" />
					<Body bold className="">
						{title}
					</Body>
				</div>
				<Body>{description}</Body>
			</div>
			{closeAble && (
				<button onClick={() => setShow(false)} className={config.body}>
					<XIcon size={16} />
				</button>
			)}
		</div>
	);
};

export default Alert;
