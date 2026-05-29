"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-5.5 w-11 shrink-0 items-center rounded-full border border-transparent transition-all outline-none",
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        "data-[state=checked]:bg-primary-blue data-[state=unchecked]:bg-surface-grey",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block h-[1.1rem] w-[1.1rem] rounded-full bg-paper-0 ring-0 transition-transform",
          "data-[state=checked]:translate-x-[1.525rem]",
          "data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
