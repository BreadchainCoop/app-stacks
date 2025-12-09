// "use client";

// import { Navbar } from "@/components/Navbar/Navbar";
// import { Footer } from "@/components/Footer/Footer";
import HomeAllStacks from "@/components/_home/all-stacks";
import HomeHeader from "@/components/_home/header";
import HomeTab from "@/components/_home/tab";
import { Body, Heading2 } from "@breadcoop/ui";

// import { LINKS } from "@/constants/links";
// import { AccountMenu } from "@/components/AccountMenu";
// import { SignInIcon } from "@phosphor-icons/react/ssr";
// import Image from "next/image";
// import Link from "next/link";

// export default function Home() {
//   const { address, isConnected } = useAccount();
//   const { disconnectAsync } = useDisconnect();
//   return (
//     <div className="min-h-screen flex flex-col bg-paper-main">
//       <Navbar />

//       <main className="flex-1 w-[1280px] mx-auto">
//         <div className="py-12">
//           <Heading3>Your Stacks dashboard</Heading3>
//         </div>
//         <div>
//           {isConnected && (
//             <div>
//               <Body>Connected to {address}</Body>
//               <div className="flex">
//                 <LiftedButton
//                   onClick={() => {
//                     disconnectAsync();
//                   }}
//                 >
//                   Disconnect
//                 </LiftedButton>
//               </div>
//             </div>
//           )}
//           {!isConnected && (
//             <div>
//               <Body>
//                 You are not signed in. Please sign in to view your account
//                 stats.
//               </Body>

//               <div className="flex ">
//                 <AccountMenu>Sign in to view dashboard</AccountMenu>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>

//       <Footer />
//     </div>
//   );
// }

export default function Home() {
	return (
		<div>
			<HomeHeader />
			<HomeTab />
			<HomeAllStacks />
			<section className="mt-6">
				<div className="flex flex-col gap-6 mb-6 md:mb-0">
					<Heading2 className="m-0 p-0 text-2xl leading-6">
						All Stacks
					</Heading2>
					<Body>Peek into all active Stack groups.</Body>
				</div>
				<HomeAllStacks />
			</section>
		</div>
	);
}
