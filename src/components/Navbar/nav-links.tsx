"use client";

import { cn } from "@/lib/utils";
import { PlusIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const CREATE_STACK_HREF = "/new";
const CREATE_STACK_LABEL = "Start stacks group";

const links = [
  { href: "/", label: "Dashboard" },
  { href: CREATE_STACK_HREF, label: CREATE_STACK_LABEL },
  { href: "/account", label: "My Account" },
];

const NavLinks = () => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 md:mr-8 md:flex-row md:items-center md:gap-4">
      <Link
        href={CREATE_STACK_HREF}
        aria-current={pathname === CREATE_STACK_HREF ? "page" : undefined}
        className="flex items-center justify-center gap-2 bg-primary-blue py-3 font-bold text-paper-main shadow-[2px_2px_0px_0px_#595959] transition-all duration-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none md:hidden"
      >
        <PlusIcon size={20} weight="bold" />
        {CREATE_STACK_LABEL}
      </Link>
      {links.map(({ href, label }) => {
        const isActive = pathname === href;
        const isCreateStack = href === CREATE_STACK_HREF;

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "text-body transition-colors hover:text-primary-blue",
              isActive ? "text-primary-blue" : "text-current",
              isCreateStack && "hidden md:inline"
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
