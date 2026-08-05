/**
 * Display size step for an amount, so long figures shrink instead of
 * overflowing their container.
 *
 * The step is driven by digits left of the decimal point, since that is what
 * grows: "$999.00" and "$50,000.00" are three glyphs apart at the same font
 * size. Each caller maps the step to its own classes, because a hero number
 * and a card total start from very different sizes.
 *
 *   base  up to 9,999
 *   sm    10,000 – 999,999
 *   xs    1,000,000 and above
 */
export type AmountSizeStep = "base" | "sm" | "xs";

export function amountSizeStep(value: number): AmountSizeStep {
  const digits = Number.isFinite(value)
    ? Math.abs(Math.trunc(value)).toString().length
    : 1;

  if (digits <= 4) return "base";
  if (digits <= 6) return "sm";
  return "xs";
}
