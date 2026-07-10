"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIsMiniPay } from "@/hooks/use-is-minipay";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/new", label: "Start stacks group" },
  { href: "/account", label: "My Account" },
];

const NavLinks = () => {
  const pathname = usePathname();
  // Creation is gated in MiniPay (invite links need EIP-712 signing)
  const isMiniPay = useIsMiniPay();
  const visibleLinks = isMiniPay
    ? links.filter(({ href }) => href !== "/new")
    : links;

  return (
    <nav className="flex flex-col gap-2 md:mr-8 md:flex-row md:gap-4">
      {visibleLinks.map(({ href, label }) => {
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "text-body transition-colors hover:text-primary-blue",
              isActive ? "text-primary-blue" : "text-current"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
};

export default NavLinks;
