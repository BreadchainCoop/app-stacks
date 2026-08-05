import { Body, Logo } from "@breadcoop/ui";
import { cn } from "@/lib/utils";
import { formatAmount, millify } from "@/utils/format-amount";

interface FormattedDecimalNumberProps {
  value: number | string;
  className?: string;
  integralPartClassName?: string;
  decimalPartClassName?: string;
  withBreadIcon?: boolean;
  breadIconClassName?: string;
  breadSize?: number;
  unit?: string;
  /** Shorten to "50k" past 10K. For tight spaces only; defaults to the full amount. */
  compact?: boolean;
}

/**
 * Fork of `@breadcoop/ui`'s FormattedDecimalNumber that formats with
 * {@link formatAmount} / {@link millify} instead of `formatBalance`.
 *
 * The shrunk decimal style exists to de-emphasise cents, so it is only applied
 * to exact amounts. Once millify compacts ("10.5k"), the fraction carries
 * magnitude rather than cents and the whole figure stays in the integral style
 * — otherwise "$10.5k" would read as "$10" at a glance.
 */
export function FormattedDecimalNumber({
  value,
  className,
  integralPartClassName,
  decimalPartClassName,
  withBreadIcon,
  breadIconClassName,
  breadSize = 24,
  unit = "",
  compact = false,
}: FormattedDecimalNumberProps) {
  const parsedValue = typeof value === "number" ? value : parseFloat(value);
  const formattedValue = compact
    ? millify(parsedValue)
    : formatAmount(parsedValue);
  const isCompact = /\D$/.test(formattedValue);
  const [integerPart, decimalPart] = formattedValue.split(".");

  return (
    <div className="inline-flex items-center justify-start gap-2">
      {withBreadIcon && (
        <Logo className={breadIconClassName} size={breadSize} />
      )}
      <Body bold className={cn(withBreadIcon && "mt-[0.2rem]", className)}>
        <span className={cn("text-base", integralPartClassName)}>
          {`${unit}${isCompact ? formattedValue : integerPart}`.trim()}
        </span>
        {!isCompact && (
          <span className={cn("text-xs", decimalPartClassName)}>
            .{decimalPart}
          </span>
        )}
      </Body>
    </div>
  );
}
