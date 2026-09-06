import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';
import { ReactNode } from 'react';
import { Address, Abi } from 'viem';
import { App } from '../interface/app.mjs';

type AuthProvider = "privy" | "general";
type TokenConfig = {
    BREAD: {
        address: Address;
        abi: Abi;
    };
};
type BreadUIKitContextType = {
    chainId: number;
    tokenConfig: TokenConfig;
    app: App;
    authProvider: AuthProvider;
};
declare const BreadUIKitContext: React.Context<BreadUIKitContextType | undefined>;
declare const BreadUIKitProvider: ({ chainId, tokenConfig, children, app, authProvider, }: {
    chainId: number;
    tokenConfig: TokenConfig;
    app: App;
    authProvider: AuthProvider;
    children: ReactNode;
}) => react_jsx_runtime.JSX.Element;
declare const useBreadUIKitContext: () => BreadUIKitContextType;
declare const useAuthProvider: () => AuthProvider;

export { BreadUIKitContext, BreadUIKitProvider, useAuthProvider, useBreadUIKitContext };
