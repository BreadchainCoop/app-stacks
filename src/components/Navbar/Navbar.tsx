"use client";

import { Navbar as LibNavbar } from "@breadcoop/ui";
import Link from "next/link";
import ClaimableWidget from "./claimable-widget";

export function Navbar() {
	return (
		<LibNavbar
			app="stacks"
			className="page-layout"
			widgetItems={
				<>
					<ClaimableWidget />
				</>
			}
		>
			<nav className="flex flex-col gap-2 md:flex-row md:gap-4 md:mr-8">
				<Link href="/" className="text-body">
					Dashboard
				</Link>
				<Link href="/new" className="text-body">
					Start stacks group
				</Link>
			</nav>
		</LibNavbar>
	);
}
