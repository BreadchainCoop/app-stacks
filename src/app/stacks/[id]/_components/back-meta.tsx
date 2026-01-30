"use client";

import BackPage from "@/components/back-page";
import { CopyStackLink } from "./copy-link";

const BackMeta = ({ className }: { className?: string }) => {
	return (
		<div className={`flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between md:flex-wrap ${className}`}>
			<BackPage label="Return to Dashboard" href="/" className="m-0!" />
			<div>
				<CopyStackLink />
			</div>
		</div>
	);
};

export default BackMeta;
