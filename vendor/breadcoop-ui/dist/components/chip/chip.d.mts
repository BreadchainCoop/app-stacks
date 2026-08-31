import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

interface ChipProps {
    size?: "small" | "regular";
    children: ReactNode;
    icon?: boolean;
    className?: string;
}
declare const Chip: ({ size, icon, className, children, }: ChipProps) => react_jsx_runtime.JSX.Element;

export { Chip as default };
