"use client";

import { Body } from "@breadcoop/ui";

interface CircleProgressBarProps {
  currentIndex: bigint;
  maxDeposits: bigint;
  className?: string;
}

export function CircleProgressBar({
  currentIndex,
  maxDeposits,
  className = "",
}: CircleProgressBarProps) {
  const current = Number(currentIndex);
  const max = Number(maxDeposits);
  const progress = max > 0 ? (current / max) * 100 : 0;

  // Determine progress color based on completion
  const getProgressColor = () => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    if (progress >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const getProgressText = () => {
    if (progress >= 100) return "Complete";
    if (progress >= 75) return "Almost Done";
    if (progress >= 50) return "Halfway";
    if (progress >= 25) return "Getting Started";
    return "Just Started";
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Progress Info */}
      <div className="flex justify-between items-center text-sm">
        <Body className="text-gray-600">
          {current} of {max} deposits
        </Body>
        <Body
          className={`font-medium ${
            progress >= 100
              ? "text-green-600"
              : progress >= 75
              ? "text-blue-600"
              : progress >= 50
              ? "text-yellow-600"
              : progress >= 25
              ? "text-orange-600"
              : "text-red-600"
          }`}
        >
          {getProgressText()}
        </Body>
      </div>

      {/* Percentage */}
      <div className="text-center mt-1">
        <Body className="text-xs text-gray-500">
          {progress.toFixed(1)}% complete
        </Body>
      </div>
    </div>
  );
}

