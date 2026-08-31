"use client";
import "../chunk-FWCSY2DS.mjs";
import { jsx } from "react/jsx-runtime";
import { createContext, useContext } from "react";
const BreadUIKitContext = createContext(void 0);
const BreadUIKitProvider = ({
  chainId,
  tokenConfig,
  children,
  app,
  authProvider
}) => {
  return /* @__PURE__ */ jsx(BreadUIKitContext.Provider, { value: { chainId, tokenConfig, app, authProvider }, children });
};
const useBreadUIKitContext = () => {
  const context = useContext(BreadUIKitContext);
  if (!context) {
    throw new Error(
      "useBreadUIKitContext must be used within a BreadUIKitProvider"
    );
  }
  return context;
};
const useAuthProvider = () => {
  const context = useBreadUIKitContext();
  return context.authProvider;
};
export {
  BreadUIKitContext,
  BreadUIKitProvider,
  useAuthProvider,
  useBreadUIKitContext
};
