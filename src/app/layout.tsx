import "./globals.css";
import { generateMetadata } from "@/utils/metadata";
import ModalPresenter from "@/components/modal/presenter";
import { Navbar } from "@/components/Navbar/Navbar";
import Providers from "@/components/providers";
import { Footer } from "@/components/footer";
import LoginTracker from "@/components/login-tracker";

export const metadata = generateMetadata();

//

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
        <div className="body-container">
          <Providers>
            <LoginTracker />
            <ModalPresenter />
            <Navbar />
            <main className="page-layout py-8">{children}</main>
            <Footer />
          </Providers>
        </div>
      </body>
    </html>
  );
}
