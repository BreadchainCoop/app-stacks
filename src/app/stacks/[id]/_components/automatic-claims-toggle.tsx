"use client";

import { useEffect, useState } from "react";
import { Address } from "viem";
import { Body } from "@breadcoop/ui";
import { HandWithdrawIcon } from "@phosphor-icons/react";
import {
  useIsAutomaticClaimsEnabled,
  useSetAutomaticClaimsEnabled,
} from "@/hooks/use-automatic-claims";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

const SUCCESS_BANNER_MS = 4000;

const AutomaticClaimsToggle = ({
  circleId,
  address,
}: {
  circleId: string;
  address: Address;
}) => {
  const { data: enabled, refetch } = useIsAutomaticClaimsEnabled({
    circleId,
    accountAddress: address,
  });
  const { setAutomaticClaimsEnabled } = useSetAutomaticClaimsEnabled();

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "success") return;
    const timeout = setTimeout(() => setStatus("idle"), SUCCESS_BANNER_MS);
    return () => clearTimeout(timeout);
  }, [status]);

  const handleToggle = async () => {
    if (status === "loading") return;
    const nextEnabled = !enabled;
    setStatus("loading");
    setErrorMessage(null);
    try {
      await setAutomaticClaimsEnabled({ circleId, enabled: nextEnabled });
      await refetch();
      setStatus("success");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update automatic claims"
      );
      setStatus("error");
    }
  };

  const isLoading = status === "loading";
  const isOn = Boolean(enabled);

  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <HandWithdrawIcon size={24} className="text-surface-ink" />
          <Body className="text-surface-ink">Activate automatic claims</Body>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label="Activate automatic claims"
          disabled={isLoading}
          onClick={handleToggle}
          className={cn(
            "relative h-[22px] w-11 shrink-0 rounded-full p-0.5 transition-colors",
            isOn ? "bg-primary-blue" : "bg-surface-grey",
            isLoading && "opacity-60 cursor-not-allowed"
          )}
        >
          <span
            className={cn(
              "block h-[17.6px] w-[17.6px] rounded-full bg-paper-0 shadow transition-transform",
              isOn ? "translate-x-[22px]" : "translate-x-0"
            )}
          />
        </button>
      </div>

      {status === "loading" && (
        <Banner tone="info">Updating automatic claims…</Banner>
      )}
      {status === "success" && (
        <Banner tone="success">
          Automatic claims {isOn ? "enabled" : "disabled"}.
        </Banner>
      )}
      {status === "error" && (
        <Banner tone="error">
          {errorMessage ?? "Something went wrong. Please try again."}
        </Banner>
      )}
    </div>
  );
};

const Banner = ({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "info" | "success" | "error";
}) => (
  <div
    className={cn(
      "px-3 py-2 text-sm border-l-4",
      tone === "info" && "bg-paper-1 border-primary-blue text-surface-ink",
      tone === "success" && "bg-paper-1 border-system-green text-system-green",
      tone === "error" && "bg-paper-1 border-system-red text-system-red"
    )}
  >
    {children}
  </div>
);

export default AutomaticClaimsToggle;
