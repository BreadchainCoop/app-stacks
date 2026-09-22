import { Body, Chip, Heading3 } from "@breadcoop/ui";
import LocalButton from "@/components/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

/** One labelled stat row in a compact stack card. */
export type StackCardStat = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
};

/**
 * A compact card for a new-type stack (goal) on the home
 * and account list surfaces. Shows a name, an optional status chip, a few
 * stats, and links to the type's detail page.
 */
const StackCard = ({
  href,
  name,
  id,
  progress,
  chip,
  stats,
}: {
  href: string;
  name: string;
  id: string;
  progress: number;
  chip?: { label: string; className?: string };
  stats: StackCardStat[];
}) => {
  return (
    <li className="border border-paper-1 p-6 flex min-w-0 flex-col gap-6 bg-paper-0 shadow-[0px_4px_12px_0px_#1B201A26] xl:max-w-94">
      <div className="flex flex-col gap-2">
        <Heading3 className="m-0 text-2xl font-bold break-words">
          {name}
        </Heading3>
        <div className="flex items-center justify-between gap-2">
          <Body bold className="min-w-0 break-words text-surface-grey">
            ID: {id}
          </Body>
          {chip && (
            <Chip
              className={cn(
                "bg-paper-main max-w-max shrink-0 hover:border-current",
                chip.className
              )}
            >
              {chip.label}
            </Chip>
          )}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Body bold className="text-xs sm:text-base">
            Goal progress
          </Body>
          <Body bold className="text-xs sm:text-base">
            {progress}%
          </Body>
        </div>
        <div
          role="progressbar"
          aria-label="Goal progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="w-full h-3.5 p-0.75 bg-paper-main"
        >
          <div
            className="h-full bg-primary-blue"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <ul className="flex flex-col gap-2.5">
        {stats.map((stat) => (
          <li key={stat.label} className="flex gap-1.25">
            <span aria-hidden="true" className="shrink-0 text-primary-blue">
              {stat.icon}
            </span>
            <Body bold className="min-w-0 break-words text-surface-grey-2">
              {stat.label}: {stat.value}
            </Body>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-3 mt-auto">
        <LocalButton
          as={Link}
          className="font-bold"
          variant="secondary"
          href={href}
        >
          View Details
        </LocalButton>
      </div>
    </li>
  );
};

export default StackCard;
