"use client";

import { Body } from "@breadcoop/ui";
import clsx from "clsx";
import { forwardRef, InputHTMLAttributes } from "react";

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      {...props}
      className={`border border-paper-2 bg-paper-1 py-3 px-4 placeholder:text-surface-grey text-surface-grey-2 font-bold placeholder:font-light ${className}`}
    />
  );
});

Input.displayName = "Input";

export const InputDescription = ({
  desc,
  className,
}: {
  desc: string;
  className?: string;
}) => {
  return (
    <Body className={clsx("font-normal text-sm text-surface-grey", className)}>
      {desc}
    </Body>
  );
};

export default Input;
