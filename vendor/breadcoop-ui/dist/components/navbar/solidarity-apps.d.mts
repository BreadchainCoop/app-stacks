import * as react_jsx_runtime from 'react/jsx-runtime';
import { App } from '../../interface/app.mjs';

interface NavSolidarityAppsProps {
    current?: App;
    className?: string;
    showTitle?: boolean;
    showSelected?: boolean;
    rearranged?: boolean;
}
declare const NavSolidarityApps: ({ current, className, showTitle, showSelected, rearranged, }: NavSolidarityAppsProps) => react_jsx_runtime.JSX.Element;
declare const NavSolidarityAppsDesktop: ({ label, app, }: {
    app: App;
    label: string;
}) => react_jsx_runtime.JSX.Element;

export { NavSolidarityApps, NavSolidarityAppsDesktop };
