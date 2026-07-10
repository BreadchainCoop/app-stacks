import "./globals.css";
import { generateMetadata } from "@/utils/metadata";
import ModalPresenter from "@/components/modal/presenter";
import { Navbar } from "@/components/Navbar/Navbar";
import Providers from "@/components/providers";
import { isServerMobile } from "@/lib/server-mobile";
import { isServerMiniPay } from "@/lib/server-minipay";
import { Footer } from "@breadcoop/ui";

export const metadata = generateMetadata();

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = await isServerMobile();
  const isMiniPay = await isServerMiniPay();

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/@rainbow-me/rainbowkit@latest/styles.css"
        />
      </head>
      <body className="font-roboto text-text-standard antialiased">
        <div className="body-container">
          <Providers isMobile={isMobile} isMiniPay={isMiniPay}>
            <ModalPresenter />
            <Navbar />
            <main className="page-layout py-8">{children}</main>
            <Footer mode="transparent" className="page-layout mt-auto" />
          </Providers>
        </div>
      </body>
    </html>
  );
}
