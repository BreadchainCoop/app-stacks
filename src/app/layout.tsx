import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "./providers/Web3Provider";

export const metadata: Metadata = {
  title: "Stacks - Bread Cooperative",
  description: "Tools for today. Solidarity forever.",
  openGraph: {
    title: "Stacks - Bread Cooperative",
    description: "Tools for today. Solidarity forever.",
    url: "https://stacks.bread.coop/",
    siteName: "Stacks - Bread Cooperative",
    images: [
      {
        url: "https://stacks.bread.coop/preview-mobile.png",
        width: 400,
        height: 600,
        alt: "Stacks - Bread Cooperative",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stacks - Bread Cooperative",
    description: "Tools for today. Solidarity forever.",
    images: ["https://stacks.bread.coop/preview.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        url: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  themeColor: "#1C5BB9",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Stacks - Bread Cooperative",
  },
};

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
