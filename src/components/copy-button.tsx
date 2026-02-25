"use client";

import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@breadcoop/ui";
import { CheckIcon } from "@phosphor-icons/react";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface CopyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  varaint: "icon" | "text" | "icon-text";
  checkedIconSize?: number;
  textToCopy: string;
}

const CopyButton = ({
  varaint,
  children,
  textToCopy,
  checkedIconSize = 24,
  ...buttonProps
}: CopyButtonProps) => {
  const { copied, copy } = useCopyToClipboard({
    textToCopy,
  });

  return (
    <button
      {...buttonProps}
      onClick={copy}
      className={cn(
        buttonProps.className,
        copied && varaint !== "icon"
          ? "bg-system-green! font-bold text-paper-main!"
          : "",
        copied && varaint === "icon" ? "text-system-green!" : ""
      )}
    >
      {copied ? (
        <>
          {varaint === "icon" ? (
            <CheckIcon size={checkedIconSize} className="" />
          ) : (
            <span className="">Copied!</span>
          )}
        </>
      ) : (
        <>{children}</>
      )}
    </button>
  );
};

export default CopyButton;
