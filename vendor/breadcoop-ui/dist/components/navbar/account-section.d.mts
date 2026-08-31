import * as react_jsx_runtime from 'react/jsx-runtime';
import { App } from '../../interface/app.mjs';
import { NavAccountDetailsProps } from './account-widget.mjs';
import 'react';
import 'wagmi';
import '@wagmi/core';
import 'viem';

interface AccountSectionProps extends Pick<NavAccountDetailsProps, "widgetItems" | "actionItems"> {
    app: App;
}
declare const AccountSection: ({ app, widgetItems, actionItems, }: AccountSectionProps) => react_jsx_runtime.JSX.Element;

export { AccountSection as default };
