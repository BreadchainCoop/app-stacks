import * as react_jsx_runtime from 'react/jsx-runtime';
import { ComponentPropsWithoutRef } from 'react';

type LogoColor = "orange" | "blue" | "jade" | "white";
type LogoVariant = "square" | "line";
type LogoProps = {
    /** Size of the logo in pixels. Defaults to 32px */
    size?: number;
    /** Additional CSS classes to apply to the logo */
    className?: string;
    /** Color variant of the logo: "orange" (default), "blue", "jade", or "white" */
    color?: LogoColor;
    /** Variant of the logo: "square" or "line" */
    variant?: LogoVariant;
    /** Optional text to display next to the logo */
    text?: string;
} & ComponentPropsWithoutRef<"svg">;
/**
 * Logo component that renders the Bread UI Kit logo SVG.
 *
 * @param size - Size of the logo in pixels (default: 32)
 * @param className - Additional CSS classes
 * @param color - Color variant: "orange" (default), "blue", "jade", or "white"
 * @param variant - Variant of the logo: "square" or "line"
 * @param text - Optional text to display next to the logo
 */
declare function Logo({ size, className, color, variant, text, ...rest }: LogoProps): react_jsx_runtime.JSX.Element | undefined;

export { type LogoColor, type LogoProps, type LogoVariant, Logo as default };
