import { Body, cn } from "@breadcoop/ui";
import { useState, useEffect } from "react";

interface CountdownProps {
  targetSeconds: number;
  className?: string;
}

export default function Countdown({
  targetSeconds,
  className,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = (): number => {
      const now = Math.floor(Date.now() / 1000);
      const difference = targetSeconds - now;
      return difference > 0 ? difference : 0;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
