import * as react_jsx_runtime from 'react/jsx-runtime';
import { Address } from 'viem';
import { NavAccountDetailsProps } from './account-widget.mjs';
import { App } from '../../interface/app.mjs';
import 'react';
import 'wagmi';
import '@wagmi/core';

interface AccountMenuProps extends Pick<NavAccountDetailsProps, "widgetItems" | "ensNameResult" | "actionItems"> {
    userAddress: Address;
    app: App;
}
declare const AccountMenu: ({ userAddress, ensNameResult, app, widgetItems, actionItems }: AccountMenuProps) => react_jsx_runtime.JSX.Element;

export { type AccountMenuProps, AccountMenu as default };
