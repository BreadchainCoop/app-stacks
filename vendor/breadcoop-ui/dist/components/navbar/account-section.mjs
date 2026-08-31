"use client";
import "../../chunk-FWCSY2DS.mjs";
import { jsx } from "react/jsx-runtime";
import { useAccount, useEnsName } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { LoginButton } from "../auth/index.mjs";
import { useConnectedUser } from "../connected-user/index.mjs";
import AccountMenu from "./account-menu.mjs";
import { SignInIcon } from "@phosphor-icons/react/dist/ssr";
import { useAuthProvider } from "../../context/lib.mjs";
import { useMemo } from "react";
const AccountSection = ({
  app,
  widgetItems,
  actionItems
}) => {
  const { user } = useConnectedUser();
  const authProvider = useAuthProvider();
  const { address: wagmiAddress } = useAccount();
  const wagmiEnsName = useEnsName({
    address: wagmiAddress,
    query: { enabled: Boolean(wagmiAddress) && authProvider === "general" }
  });
  const { ready: privyReady } = usePrivy();
  const { address, ensNameResult } = useMemo(() => {
    if (authProvider === "privy") {
      const connectedUser = user;
      return {
        address: connectedUser == null ? void 0 : connectedUser.address,
        ensNameResult: {
          data: void 0,
          isLoading: !privyReady,
          isError: false
        }
      };
    }
    return {
      address: wagmiAddress,
      ensNameResult: wagmiEnsName
    };
  }, [authProvider, user, privyReady, wagmiAddress, wagmiEnsName]);
  if (user.status === "CONNECTED" && address) {
    return /* @__PURE__ */ jsx(
      AccountMenu,
      {
        widgetItems,
        actionItems,
        userAddress: address,
        ensNameResult,
        app
      }
    );
  }
  return /* @__PURE__ */ jsx("div", { className: "mt-6 md:mt-0", children: /* @__PURE__ */ jsx(
    LoginButton,
    {
      app,
      status: user.status,
      rightIcon: /* @__PURE__ */ jsx(SignInIcon, { size: 24 })
    }
  ) });
};
var account_section_default = AccountSection;
export {
  account_section_default as default
};
