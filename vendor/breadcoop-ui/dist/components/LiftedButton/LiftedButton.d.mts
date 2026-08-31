import * as react_jsx_runtime from 'react/jsx-runtime';
import React__default from 'react';
import { LiftedButtonPreset, LiftedButtonColors } from './LiftedButtonPresets.mjs';

type LiftedButtonProps = {
    children: React__default.ReactNode;
    leftIcon?: React__default.ReactNode;
    rightIcon?: React__default.ReactNode;
    disabled?: boolean;
    preset?: LiftedButtonPreset;
    colorOverrides?: Partial<LiftedButtonColors>;
    offsetPx?: number;
    durationMs?: number;
    className?: string;
    width?: "full" | "auto" | "mobile-full";
    scrollTo?: string;
} & React__default.ComponentPropsWithoutRef<"button">;
/**
 * LiftedButton — a square-edged button that floats up-left of a dark base layer.
 * - Preset: Choose "primary" (default), "secondary", "destructive", or "positive"
 * - ColorOverrides: Pass in a dict specifying manual colours
 * - Hover: fades to alternate colors.
 * - Active: depresses button and colors return to normal.
 * - Transition duration defaults to 500ms.
 * - Icons can be rendered on the right or left.
 */
declare function LiftedButton({ children, leftIcon, rightIcon, disabled, preset, colorOverrides, offsetPx, durationMs, className, type, width, scrollTo, ...rest }: LiftedButtonProps): react_jsx_runtime.JSX.Element;

export { type LiftedButtonProps, LiftedButton as default };
