"use client";

import { ReactNode, useRef } from "react";
import { ListIcon, XIcon } from "@phosphor-icons/react";

interface NavbarMenuProps {
  mobileHeader: ReactNode;
  mobileTop?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

const NavbarMenu = ({
  mobileHeader,
  mobileTop,
  children,
  footer,
}: NavbarMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (close = false) => {
    if (close) {
      menuRef.current?.classList.remove("translate-x-0!");
      return;
    }
    menuRef.current?.classList.toggle("translate-x-0!");
  };

  return (
    <>
      <button
        onClick={() => toggleMenu()}
        className="ml-auto relative w-10 h-10 flex flex-col items-center justify-center space-y-1.5 focus:outline-none group md:hidden text-primary-blue"
        aria-label="Toggle menu"
      >
        <ListIcon size={32} />
      </button>
      <div
        ref={menuRef}
        className="bg-paper-main fixed overflow-y-scroll top-0 left-0 z-50 h-screen w-screen py-2.5 px-6 transition-transform translate-x-full md:static md:h-auto md:w-auto md:translate-x-0 md:py-0 md:px-0 md:flex md:items-center md:justify-end md:overflow-x-visible md:overflow-y-visible md:transition-none md:z-auto"
      >
        <div className="flex items-center justify-between mb-6 md:hidden">
          {mobileHeader}
          <button
            className="z-60 h-8 w-8 ml-auto block md:hidden text-primary-blue"
            onClick={() => toggleMenu(true)}
            aria-label="Close menu"
          >
            <XIcon size={32} />
          </button>
        </div>
        {mobileTop && <div className="mb-6 md:hidden">{mobileTop}</div>}
        <div onClick={() => toggleMenu(true)}>{children}</div>
        {footer}
      </div>
    </>
  );
};

export default NavbarMenu;
