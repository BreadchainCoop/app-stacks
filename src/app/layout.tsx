import "./globals.css";
import { Web3Provider } from "./providers/Web3Provider";
import { generateMetadata } from "@/utils/metadata";
import { Footer } from "@breadcoop/ui";
import ModalPresenter from "@/components/modal/presenter";
import { ModalProvider } from "@/components/modal/context";
import { Navbar } from "@/components/Navbar/Navbar";

export const metadata = generateMetadata();

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<link
					rel="stylesheet"
					href="https://unpkg.com/@rainbow-me/rainbowkit@latest/styles.css"
				/>
			</head>
			<body className="font-roboto text-text-standard antialiased">
				<div className="overflow-x-hidden">
					<Web3Provider>
						<ModalProvider>
							<ModalPresenter />
							<Navbar />
							<main className="page-layout py-8">{children}</main>
							<Footer
								mode="transparent"
								className="page-layout"
							/>
						</ModalProvider>
					</Web3Provider>
				</div>
			</body>
		</html>
	);
}
