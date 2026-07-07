"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/new", label: "Start stacks group" },
  { href: "/account", label: "My Account" },
];

const NavLinks = () => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 md:mr-8 md:flex-row md:gap-4">
      {links.map(({ href, label }) => {
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "text-body transition-colors hover:text-primary-blue",
              isActive && "text-primary-blue"
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
