import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

interface NavbarMenuProps {
    textClassName: string;
    mobileHeader: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
}
declare function NavbarMenu({ textClassName, mobileHeader, children, footer, }: NavbarMenuProps): react_jsx_runtime.JSX.Element;

export { NavbarMenu };
