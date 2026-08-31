"use client";
import "../../chunk-FWCSY2DS.mjs";
import { jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { useChains } from "wagmi";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ConnectedUserContext } from "./context.mjs";
function ConnectedUserProviderPrivy({
  chainId,
  children
}) {
  var _a;
  const { ready, authenticated, user: privyUser } = usePrivy();
  const { wallets } = useWallets();
  const configuredChains = useChains();
  const accountAddress = (_a = privyUser == null ? void 0 : privyUser.wallet) == null ? void 0 : _a.address;
  const connectedWallet = useMemo(
    () => accountAddress ? wallets.find(
      (w) => w.address.toLowerCase() === accountAddress.toLowerCase()
    ) : void 0,
    [wallets, accountAddress]
  );
  const defaultChain = useMemo(
    () => {
      var _a2;
      return (_a2 = configuredChains.find((c) => c.id === chainId)) != null ? _a2 : configuredChains[0];
    },
    [configuredChains, chainId]
  );
  const user = useMemo(() => {
    var _a2;
    if (!ready) return { status: "LOADING" };
    if (!authenticated || !accountAddress) {
      return { status: "NOT_CONNECTED" };
    }
    const address = accountAddress;
    const walletChainId = connectedWallet == null ? void 0 : connectedWallet.chainId;
    const parsedChainId = walletChainId ? parseInt(walletChainId.split(":")[1]) : void 0;
    const _status = parsedChainId === chainId ? "CONNECTED" : "UNSUPPORTED_CHAIN";
    const chain = (_a2 = configuredChains.find((c) => c.id === parsedChainId)) != null ? _a2 : defaultChain;
    return {
      status: _status,
      address,
      chain
    };
  }, [
    ready,
    authenticated,
    accountAddress,
    connectedWallet,
    chainId,
    configuredChains,
    defaultChain
  ]);
  const isSafe = useMemo(() => {
    return (connectedWallet == null ? void 0 : connectedWallet.walletClientType) === "safe" || false;
  }, [connectedWallet]);
  const value = useMemo(() => ({ user, isSafe }), [user, isSafe]);
  return /* @__PURE__ */ jsx(ConnectedUserContext.Provider, { value, children });
}
export {
  ConnectedUserProviderPrivy
};
