import "./globals.css";
import { Web3Provider } from "./providers/Web3Provider";
import { generateMetadata } from "@/utils/metadata";

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
      <body className="font-roboto bg-paper-main text-text-standard antialiased">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
