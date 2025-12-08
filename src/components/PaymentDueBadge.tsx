"use client";

import { Body } from "@breadcoop/ui";

interface PaymentDueBadgeProps {
  currentIndex: bigint;
  maxDeposits: bigint;
  circleStart: bigint;
  depositInterval: bigint;
  className?: string;
}

export function PaymentDueBadge({
  currentIndex,
  maxDeposits,
  circleStart,
  depositInterval,
  className = "",
}: PaymentDueBadgeProps) {
  const current = Number(currentIndex);
  const max = Number(maxDeposits);
  const startTime = Number(circleStart);
  const interval = Number(depositInterval);

  // Check if circle is complete
  if (current >= max) {
    return (
      <div
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 ${className}`}
      >
        <Body>Complete</Body>
      </div>
    );
  }

  // Calculate next payment due time
  const nextPaymentTime = startTime + current * interval;
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

  // Check if payment is overdue
  const isOverdue = currentTime > nextPaymentTime;

  // Check if payment is due soon (within 24 hours)
  const isDueSoon =
    nextPaymentTime - currentTime <= 86400 && nextPaymentTime - currentTime > 0;

  // Check if payment is due now (within 1 hour)
  const isDueNow =
    nextPaymentTime - currentTime <= 3600 && nextPaymentTime - currentTime > 0;

  if (isOverdue) {
    return (
      <div
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 ${className}`}
      >
        <Body>Payment Overdue</Body>
      </div>
    );
  }

  if (isDueNow) {
    return (
      <div
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 ${className}`}
      >
        <Body>Due Now</Body>
      </div>
    );
  }

  if (isDueSoon) {
    return (
      <div
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 ${className}`}
      >
        <Body>Due Soon</Body>
      </div>
    );
  }

  // No payment due
  return (
    <div
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 ${className}`}
    >
      <Body>Up to Date</Body>
    </div>
  );
}
