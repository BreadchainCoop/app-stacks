"use client";
import "../../chunk-FWCSY2DS.mjs";
import { jsx } from "react/jsx-runtime";
import { useAuthProvider, useBreadUIKitContext } from "../../context/lib.mjs";
import { ConnectedUserProviderPrivy } from "./privy-provider.mjs";
import { ConnectedUserProviderGeneral } from "./provider-general.mjs";
function ConnectedUserProvider({ children }) {
  const authProvider = useAuthProvider();
  const { chainId } = useBreadUIKitContext();
  const Provider = authProvider === "privy" ? ConnectedUserProviderPrivy : ConnectedUserProviderGeneral;
  return /* @__PURE__ */ jsx(Provider, { chainId, children });
}
export {
  ConnectedUserProvider
};
