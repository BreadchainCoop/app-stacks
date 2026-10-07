"use client";

import Link from "next/link";
import { Caption } from "@breadcoop/ui";
import { LINKS } from "@/constants/links";
import { useChainPath } from "@/components/providers/active-chain";

/**
 * Terms of Service, Privacy Policy and a support contact.
 *
 * MiniPay's listing rules require all three to be reachable from inside the
 * Mini App — the `@breadcoop/ui` Footer carries none of them and accepts no
 * link slots, so they live here instead.
 *
 * Each entry appears only once its URL is set, so a missing one is invisible
 * rather than a dead link. Terms and Privacy are app routes; anything external
 * (support, once it has a channel) opens in a new tab instead.
 */
const ENTRIES = [
  { href: LINKS.termsOfService, label: "Terms of Service" },
  { href: LINKS.privacyPolicy, label: "Privacy Policy" },
  { href: LINKS.support, label: "Support" },
];

const LegalLinks = () => {
  const chainHref = useChainPath();
  const entries = ENTRIES.filter(({ href }) => href.trim() !== "");

  if (entries.length === 0) return null;

  return (
    <nav
      aria-label="Legal and support"
      className="page-layout flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-6"
    >
      {entries.map(({ href, label }) => {
        const className =
          "text-surface-grey-2 underline hover:text-primary-blue";
        const isInternal = href.startsWith("/");

        return (
          <Caption key={label}>
            {isInternal ? (
              // Keeps the active chain, like every other in-app link.
              <Link href={chainHref(href)} className={className}>
                {label}
              </Link>
            ) : (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {label}
              </a>
            )}
          </Caption>
        );
      })}
    </nav>
  );
};

export default LegalLinks;
