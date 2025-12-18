// "use client";

// import {
// 	LoginButton,
// 	Logo,
// 	NavSolidarityApps,
// 	NavSolidarityAppsDesktop,
// } from "@breadcoop/ui";
// import Link from "next/link";
// import { useRef } from "react";
// import { ListIcon, XIcon } from "@phosphor-icons/react";

// export function Navbar() {
// 	const menuRef = useRef<HTMLDivElement>(null);

// 	const toggleMenu = (close = false) => {
// 		if (close) {
// 			menuRef.current?.classList.remove("translate-x-0!");

// 			return;
// 		}

// 		menuRef.current?.classList.toggle("translate-x-0!");
// 	};

// 	return (
// 		<div className="page-layout relative py-2.5 flex items-center justify-between">
// 			<Link href="/">
// 				<Logo size={24} className="md:hidden" />
// 				<span className="hidden md:block lg:text-2xl">
// 					<Logo text="BREAD" size={24} />
// 				</span>
// 			</Link>
// 			<NavSolidarityAppsDesktop app="stacks" label="Stacks" />
// 			<button
// 				onClick={() => toggleMenu()}
// 				className="ml-auto relative w-10 h-10 flex flex-col items-center justify-center space-y-1.5 focus:outline-none text-primary-blue group md:hidden"
// 				aria-label="Toggle menu"
// 			>
// 				<ListIcon size={32} />
// 			</button>
// 			<div
// 				ref={menuRef}
// 				className="bg-paper-main fixed overflow-y-scroll top-0 left-0 z-50 h-screen w-screen py-2.5 px-6 transition-transform translate-x-full md:static md:h-auto md:w-auto md:translate-x-0 md:py-0 md:px-0 md:flex md:items-center md:justify-end md:overflow-x-hidden md:transition-none md:z-auto"
// 			>
// 				<div className="flex items-center justify-between mb-6 md:hidden">
// 					<Link href="/">
// 						<Logo text="Solidarity Fund" />
// 					</Link>
// 					<button
// 						className="z-[60] h-8 w-8 text-primary-blue ml-auto block md:hidden"
// 						onClick={() => toggleMenu(true)}
// 					>
// 						<XIcon size={32} />
// 					</button>
// 				</div>
// 				<nav className="flex flex-col gap-2 md:flex-row md:gap-4 md:mr-8">
// 					<Link href="/" className="text-body">
// 						Dashboard
// 					</Link>
// 					<Link href="/new" className="text-body">
// 						Start stacks group
// 					</Link>
// 				</nav>
// 				<NavSolidarityApps
// 					showTitle
// 					showSelected
// 					rearranged
// 					current="stacks"
// 					className="mt-6 md:hidden"
// 				/>
// 				<div className="mt-6 md:mt-0">
// 					<LoginButton app="stacks" status="NOT_CONNECTED" />
// 				</div>
// 			</div>
// 			{/* <AccountMenu fullWidth={true}>Sign in</AccountMenu> */}
// 		</div>
// 	);
// }

"use client";

import { Navbar as LibNavbar } from "@breadcoop/ui";
import Link from "next/link";

export function Navbar() {
	return (
		<LibNavbar app="stacks" className="page-layout">
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
