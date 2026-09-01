"use client";
import "../../chunk-FWCSY2DS.mjs";
import { jsx } from "react/jsx-runtime";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import LiftedButton from "../LiftedButton/LiftedButton.mjs";
import { ButtonShell } from "./button-shell.mjs";
import { useBreadUIKitContext } from "../../context/lib.mjs";
const LoginButtonPrivy = ({
  app,
  status,
  label = "Sign In",
  rightIcon
}) => {
  var _a;
  const { chainId } = useBreadUIKitContext();
  const className = app === "fund" ? "bg-primary-orange" : app === "stacks" ? "bg-primary-blue" : "bg-primary-jade";
  const { login, ready, user: privyUser } = usePrivy();
  const { wallets } = useWallets();
  if (status === "CONNECTED") return null;
  if (status === "LOADING" || !ready) return /* @__PURE__ */ jsx(ButtonShell, {});
  if (status === "UNSUPPORTED_CHAIN") {
    const accountAddress = (_a = privyUser == null ? void 0 : privyUser.wallet) == null ? void 0 : _a.address;
    const activeWallet = accountAddress ? wallets.find(
      (w) => w.address.toLowerCase() === accountAddress.toLowerCase()
    ) : void 0;
    return /* @__PURE__ */ jsx(
      SwitchNetwork,
      {
        activeWallet,
        chainId,
        className
      }
    );
  }
  return /* @__PURE__ */ jsx("div", { className: "[&>*]:w-full", children: /* @__PURE__ */ jsx(
    LiftedButton,
    {
      onClick: login,
      rightIcon,
      className: `w-full ${className}`,
      children: label
    }
  ) });
};
function SwitchNetwork({
  activeWallet,
  chainId,
  className
}) {
  return /* @__PURE__ */ jsx("div", { className: "[&>*]:w-full", children: /* @__PURE__ */ jsx(
    LiftedButton,
    {
      onClick: async () => {
        if (!activeWallet) return;
        try {
          await activeWallet.switchChain(chainId);
        } catch (error) {
          console.error("Failed to switch chain:", error);
        }
      },
      className: `w-full ${className}`,
      children: "Change network"
    }
  ) });
}
export {
  LoginButtonPrivy
};
