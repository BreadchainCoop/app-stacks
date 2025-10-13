import Image from "next/image";
import Link from "next/link";
import {
  GithubLogoIcon,
  LinkedinLogoIcon,
  YoutubeLogoIcon,
  DiscordLogoIcon,
  XLogoIcon,
  EnvelopeSimpleIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react/ssr";
import { Body, Heading3 } from "@breadcoop/ui";
import { SOLIDARITY_TOOLS } from "@/constants/solidarityTools";
import { LINKS } from "@/constants/links";

// Social Icons Component
function SocialIcons({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center md:justify-start gap-5 pb-6 md:pb-0 ${className}`}
    >
      <a href={LINKS.youtube} className="block">
        <YoutubeLogoIcon className="w-6 h-6 text-surface-ink" />
      </a>
      <a href={LINKS.linkedin} className="block">
        <LinkedinLogoIcon className="w-6 h-6 text-surface-ink" />
      </a>
      <a
        href={LINKS.github}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <GithubLogoIcon className="w-6 h-6 text-surface-ink" />
      </a>
      <a href={LINKS.discord} className="block">
        <DiscordLogoIcon className="w-6 h-6 text-surface-ink" />
      </a>
      <a href={LINKS.twitter} className="block">
        <XLogoIcon className="w-6 h-6 text-surface-ink" />
      </a>
      <a href={LINKS.newsletter} className="block">
        <Image
          src="/paragraph.png"
          alt="Paragraph icon"
          width={24}
          height={24}
          className="p-[3px] w-6 h-6 text-surface-ink"
        />
      </a>
      <a href={LINKS.farcaster} className="block">
        <Image
          src="/farcaster-icon.png"
          alt="Farcaser icon"
          width={24}
          height={24}
          className="p-[3px] w-6 h-6 text-surface-ink"
        />
      </a>
    </div>
  );
}

// Reusable Footer Link Component
function FooterLink({
  href,
  children,
  isExternal = false,
}: {
  href: string;
  children: React.ReactNode;
  isExternal?: boolean;
}) {
  const isDisabled = !href || href.trim() === "";

  if (isDisabled) {
    return (
      <Body className="text-surface-ink font-breadBody flex items-center gap-2 opacity-50 ">
        {children}
      </Body>
    );
  }

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : "_self"}
      rel={isExternal ? "noopener noreferrer" : ""}
      className="text-surface-ink hover:text-paper-0 font-breadBody flex items-center gap-2"
    >
      {children}
      {isExternal && <ArrowUpRightIcon className="w-6 h-6 text-orange-0" />}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-primary-orange px-4 py-12">
      <div className="md:max-w-[1280px] mx-auto ">
        {/* Top Row - Logo, Name, and Social Icons (Tablet Layout) */}
        <div className="max-w-[318px] md:max-w-[1280px] mx-auto md:flex md:items-center md:justify-between md:mb-8 xl:hidden">
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <Image
                src="/logo-white.svg"
                alt="Bread Cooperative Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="font-breadDisplay mt-1 font-bold text-[24px] text-white">
                BREAD COOPERATIVE
              </span>
            </div>
            <p className="text-white font-breadBody text-center md:text-left">
              Solidarity forever.
            </p>
          </div>
          <div className="justify-center md:justify-end">
            <SocialIcons />
          </div>
        </div>

        <div className="max-w-[318px] md:max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {/* Logo and Tagline (Desktop Layout) */}
          <div className="hidden xl:block xl:col-span-2 xl:max-w-[311px]">
            <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
              <Image
                src="/logo-white.svg"
                alt="Bread Cooperative Logo"
                width={24}
                height={24}
                className="w-6 h-6 mb-1"
              />
              <span className="font-breadDisplay font-bold text-[24px] text-white">
                BREAD COOPERATIVE
              </span>
            </div>
            <p className="text-white font-breadBody mb-6 text-center md:text-left">
              Solidarity forever.
            </p>

            {/* Social Icons */}
            <div className="mb-4">
              <SocialIcons className="xl:gap-4" />
            </div>
          </div>

          {/* Cooperative Column */}
          <div>
            <Body className="text-lg text-white mb-4">Cooperative</Body>
            <ul className="space-y-3">
              <li>
                <FooterLink href={LINKS.docs}>Documentation</FooterLink>
              </li>
              <li>
                <FooterLink href={LINKS.newsletter}>Blog</FooterLink>
              </li>
              <li>
                <FooterLink href={LINKS.contributorForm}>Contribute</FooterLink>
              </li>
            </ul>
          </div>

          {/* Solidarity Tools Column */}
          <div>
            <Body className="text-lg text-white mb-4">Solidarity tools</Body>
            <ul className="space-y-3">
              {SOLIDARITY_TOOLS.map((tool) => (
                <li key={tool.id}>
                  <FooterLink
                    href={tool.webLink || ""}
                    isExternal={!tool.comingSoon}
                  >
                    {tool.title}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Reach Out Column */}
          <div>
            <Body className="text-lg text-white mb-4">Reach out</Body>
            <Link
              href="mailto:contact@bread.coop"
              className="text-surface-ink hover:text-paper-0 font-breadBody flex items-center gap-2"
            >
              <EnvelopeSimpleIcon className="w-6 h-6 text-orange-0" />
              contact@bread.coop
            </Link>
          </div>

          {/* Support Us Column */}
          <div>
            <Body className="text-lg text-white mb-4">Support us</Body>
            <ul className="space-y-3">
              <li>
                <FooterLink href={LINKS.giveth} isExternal>
                  Donate in crypto
                </FooterLink>
              </li>
              <li>
                <FooterLink href={LINKS.openCollective} isExternal>
                  Donate in fiat
                </FooterLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-orange-0 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <Body className="text-white text-sm">
            Creative Commons ©BREAD Cooperative
          </Body>
          <div className="flex items-center gap-4">
            <Body className="text-white text-sm">All Rights Reserved</Body>
            {/* TODO: Add terms and conditions and privacy policy #10 */}
            {/* <span className="text-white">|</span> */}
            {/* <Link
              href="#"
              className="text-orange-0 hover:text-paper-0 font-breadBody"
            >
              Terms and Conditions
            </Link>
            <span className="text-white">|</span>
            <Link
              href="#"
                className="text-orange-0 hover:text-paper-0 font-breadBody"
            >
              Privacy Policy
            </Link> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
