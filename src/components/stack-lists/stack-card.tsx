import { Body, Chip, cn, Heading3 } from "@breadcoop/ui";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import type { ReactNode } from "react";

/** One labelled stat row in a compact stack card. */
export type StackCardStat = { label: string; value: ReactNode };

/**
 * A compact card for a new-type stack (ASCA / goal / collective) on the home
 * and account list surfaces. Shows a name, an optional status chip, a few
 * stats, and links to the type's detail page.
 */
const StackCard = ({
  href,
  name,
  chip,
  stats,
}: {
  href: string;
  name: string;
  chip?: { label: string; className?: string };
  stats: StackCardStat[];
}) => {
  return (
    <Link
      href={href}
      className="card-shadow-border card-shadow-bg flex flex-col gap-4 p-6 transition-colors hover:border-primary-blue"
    >
      <div className="flex items-start justify-between gap-2">
        <Heading3 className="text-xl leading-6 text-primary-blue">
          {name}
        </Heading3>
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
      <div className="flex flex-col gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <Body className="text-surface-grey-2">{stat.label}</Body>
            <Body bold className="text-right">
              {stat.value}
            </Body>
          </div>
        ))}
      </div>
      <Body
        bold
        className="mt-auto inline-flex items-center gap-1 text-primary-blue"
      >
        View details
        <ArrowRightIcon className="size-4" />
      </Body>
    </Link>
  );
};

export default StackCard;
