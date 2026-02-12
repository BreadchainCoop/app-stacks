import { Metadata } from "next";

interface MetadataConfig {
  title?: string;
  description?: string;
  url?: string;
  ogImageVersion?: string; // for cache busting
  images?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }[];
  locale?: string;
  type?: string;
  themeColor?: string;
}

const SITE_NAME = "Stacks - Bread Cooperative";
const BASE_URL = "https://stacks.bread.coop";
const DEFAULT_OG_IMAGE_VERSION = "v1";

const defaultConfig: Omit<MetadataConfig, "ogImageVersion"> = {
  title: "Stacks - Bread Cooperative",
  description: "Stack money faster with friends",
  url: "/",
  locale: "en_US",
  type: "website",
  themeColor: "#1C5BB9",
};

export function generateMetadata(config: MetadataConfig = {}): Metadata {
  const mergedConfig = { ...defaultConfig, ...config };
  const imageVersion = config.ogImageVersion || DEFAULT_OG_IMAGE_VERSION;

  const images = config.images
    ? config.images
    : [
        {
          url: `/opengraph-image.png?v=${imageVersion}`,
          width: 1912,
          height: 1200,
          alt: mergedConfig.title,
        },
      ];

  return {
    metadataBase: new URL(BASE_URL),
    title: mergedConfig.title,
    description: mergedConfig.description,
    openGraph: {
      title: mergedConfig.title,
      description: mergedConfig.description,
      url: mergedConfig.url,
      siteName: SITE_NAME,
      images: images,
      locale: mergedConfig.locale,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: mergedConfig.type as any,
    },
    twitter: {
      card: "summary_large_image",
      title: mergedConfig.title,
      description: mergedConfig.description,
      images: images?.map((img) => img.url) || [],
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      ],
      apple: [
        { url: "/apple-icon-57x57.png", sizes: "57x57", type: "image/png" },
        { url: "/apple-icon-60x60.png", sizes: "60x60", type: "image/png" },
        { url: "/apple-icon-72x72.png", sizes: "72x72", type: "image/png" },
        { url: "/apple-icon-76x76.png", sizes: "76x76", type: "image/png" },
        { url: "/apple-icon-114x114.png", sizes: "114x114", type: "image/png" },
        { url: "/apple-icon-120x120.png", sizes: "120x120", type: "image/png" },
        { url: "/apple-icon-144x144.png", sizes: "144x144", type: "image/png" },
        { url: "/apple-icon-152x152.png", sizes: "152x152", type: "image/png" },
        { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        {
          url: "/android-icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          rel: "msapplication-TileImage",
          url: "/ms-icon-144x144.png",
        },
      ],
    },
    manifest: "/manifest.json",
    themeColor: mergedConfig.themeColor,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: mergedConfig.title,
    },
    other: {
      "msapplication-TileColor": "#ffffff",
    },
  };
}
