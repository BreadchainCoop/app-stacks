"use client";

import { ReactNode, useRef, useState } from "react";
import { Body, useBreadBalance } from "@breadcoop/ui";
import { FormattedDecimalNumber } from "../formatted-decimal-number";
import { CaretDownIcon } from "@phosphor-icons/react";
import { blo } from "blo";
import { cn } from "@/lib/utils";
import { useClickOutside } from "./use-click-outside";
import { useConnectedAccount } from "./use-connected-account";
import AccountWidget from "./account-widget";

interface AccountMenuProps {
  widgetItems?: ReactNode;
  actionItems?: ReactNode;
  depositSlot?: ReactNode;
}

const AccountMenu = ({
  widgetItems,
  actionItems,
  depositSlot,
}: AccountMenuProps) => {
  const { address, displayName } = useConnectedAccount();
  const { BREAD } = useBreadBalance({ address: address! });
  const avatar = blo(address!);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <div className="flex items-center gap-2.5 bg-paper-main border border-surface-ink overflow-hidden p-2">
        <div className="flex items-center bg-paper-main border border-surface-grey overflow-hidden px-2 py-1">
          <FormattedDecimalNumber
            value={BREAD}
            unit="$"
            compact
            integralPartClassName="text-base"
            decimalPartClassName="text-xs"
          />
        </div>
        {depositSlot}
        <div className="h-7 w-px bg-surface-grey/40 shrink-0" />
        <button
          type="button"
          className="group flex items-center gap-2.5"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <img src={avatar} alt="" className="shrink-0 size-6 rounded-full" />
          <Body
            bold
            className="text-surface-ink whitespace-nowrap leading-none"
          >
            {displayName}
          </Body>
          <span
            className={cn(
              "shrink-0 transition-transform duration-300 text-primary-blue",
              open && "rotate-180"
            )}
          >
            <CaretDownIcon size={24} />
          </span>
        </button>
      </div>
      {open && (
        <div className="absolute top-full right-0 mt-2 z-20">
          <AccountWidget
            className="border w-full md:w-screen md:max-w-110.75 md:bg-paper-main md:border-paper-2"
            address={address!}
            displayName={displayName}
            widgetItems={widgetItems}
            actionItems={actionItems}
          />
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
