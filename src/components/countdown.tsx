"use client";

import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { Body, cn } from "@breadcoop/ui";
import { useState, useEffect, useRef } from "react";

interface CountdownProps {
  targetSeconds: number;
  className?: string;
  /** Fires once when the countdown reaches zero (re-armed when the target changes). */
  onComplete?: () => void;
}

export default function Countdown({
  targetSeconds,
  className,
  onComplete,
}: CountdownProps) {
  const blockTimestamp = useBlockTimestamp(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const baseRef = useRef({ blockTime: 0, wallTime: 0 });
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  // Guards onComplete to a single call per target window.
  const completedRef = useRef(false);

  // A new target (e.g. the next round) can complete again.
  useEffect(() => {
    completedRef.current = false;
  }, [targetSeconds]);

  useEffect(() => {
    const fireIfDone = (remaining: number) => {
      if (remaining <= 0 && !completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
    };

    const blockNowSec = Math.floor(blockTimestamp / 1000);
    baseRef.current = { blockTime: blockNowSec, wallTime: Date.now() };

    const diff = targetSeconds - blockNowSec;
    setTimeLeft(diff > 0 ? diff : 0);
    fireIfDone(diff);

    const timer = setInterval(() => {
      const elapsedSec = Math.floor(
        (Date.now() - baseRef.current.wallTime) / 1000
      );
      const remaining = targetSeconds - baseRef.current.blockTime - elapsedSec;
      setTimeLeft(remaining > 0 ? remaining : 0);
      fireIfDone(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [blockTimestamp, targetSeconds]);

  const formatTime = (seconds: number): string => {
    if (seconds === 0) return "0 days";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];

    if (days > 0) {
      parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    }
    if (hours > 0 || days > 0) {
      parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
    }
    if (minutes > 0 || hours > 0 || days > 0) {
      parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
    }
    parts.push(`${secs} second${secs !== 1 ? "s" : ""}`);

    return parts.join("  ");
  };

  return (
    <Body className={cn("text-surface-grey", className)}>
      {formatTime(timeLeft)}
    </Body>
  );
}
