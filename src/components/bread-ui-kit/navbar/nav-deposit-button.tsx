"use client";

import { ReactNode } from "react";
import clsx from "clsx";
import { App } from "./type";

export interface NavDepositButtonProps {
  app: App;
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * The styled "Deposit" button used in the nav account widget. App-themed and
 * shared across Bread apps; each app injects its own `onClick` (e.g. open a
 * fund/on-ramp flow). Matches the Figma "Small button" lift/press interaction.
 *
 * Pass it to <Navbar depositSlot={...}> so the widget renders it in place.
 */
const ACCENT: Record<App, { border: string; text: string; hoverBg: string }> = {
  fund: {
    border: "border-primary-orange",
    text: "text-primary-orange",
    hoverBg: "hover:bg-primary-orange",
  },
  stacks: {
    border: "border-primary-blue",
    text: "text-primary-blue",
    hoverBg: "hover:bg-primary-blue",
  },
  net: {
    border: "border-primary-jade",
    text: "text-primary-jade",
    hoverBg: "hover:bg-primary-jade",
  },
};

export function NavDepositButton({
  app,
  onClick,
  disabled = false,
  children = "Deposit",
}: NavDepositButtonProps) {
  const accent = ACCENT[app];

  return (
    <button
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick?.();
      }}
      disabled={disabled}
      className={clsx(
        "group relative inline-flex shrink-0",
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      )}
    >
      {/* Shadow layer — sits 2px down-right behind the face */}
      <span
        aria-hidden="true"
        className="absolute inset-0 translate-x-[2px] translate-y-[2px] bg-surface-grey-2"
      />
      {/* Face — lifted above the shadow; presses onto it on :active */}
      <span
        className={clsx(
          "relative flex items-center bg-paper-main border px-4 py-1 font-bold text-base leading-[1.5] whitespace-nowrap transition-[transform,background-color,color] duration-100 ease-out",
          accent.border,
          accent.text,
          disabled
            ? "opacity-40"
            : clsx(
                accent.hoverBg,
                "group-hover:text-paper-main group-active:translate-x-[2px] group-active:translate-y-[2px]"
              )
        )}
      >
        {children}
      </span>
    </button>
  );
}

export default NavDepositButton;
