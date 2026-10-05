// Bundled rather than pulled from unpkg at runtime: a third-party
// render-blocking stylesheet costs a round trip on first paint and adds an
// origin to the MiniPay network manifest.
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { generateMetadata } from "@/utils/metadata";
import ModalPresenter from "@/components/modal/presenter";
import { Navbar } from "@/components/Navbar/Navbar";
import Providers from "@/components/providers";
import { isServerMobile } from "@/lib/server-mobile";
import { isServerMiniPay } from "@/lib/server-minipay";
import { Footer } from "@breadcoop/ui";
import MigrateAndTransferBanner from "@/components/migrate-and-transfer-banner";
// TEMPORARY: renders only when NEXT_PUBLIC_DEBUG_TX=1. Remove with
// src/utils/debug-tx.ts.
import DebugTxPanel from "@/components/debug-tx-panel";

export const metadata = generateMetadata();

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // These two headers() reads are what keep every route dynamically rendered,
  // which is in turn what lets <Providers> read `?chain=` with useSearchParams
  // during the server render.
  const isMobile = await isServerMobile();
  const isMiniPay = await isServerMiniPay();

  return (
    <html lang="en">
      <body className="font-roboto text-text-standard antialiased">
        <div className="body-container">
          <Providers isMobile={isMobile} isMiniPay={isMiniPay}>
            <ModalPresenter />
            <Navbar />
            <MigrateAndTransferBanner />
            <main className="page-layout py-8">{children}</main>
            <Footer mode="transparent" className="page-layout mt-auto" />
            <DebugTxPanel />
          </Providers>
        </div>
      </body>
    </html>
  );
}
