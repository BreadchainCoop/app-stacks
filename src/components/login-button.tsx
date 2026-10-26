"use client";

import { ComponentProps } from "react";
import {
  Body,
  LiftedButton,
  LoginButton as UIKitLoginButton,
} from "@breadcoop/ui";
import { BaseError, useConnect } from "wagmi";
import { useWalletHost } from "@/components/providers/is-minipay";

type LoginButtonProps = ComponentProps<typeof UIKitLoginButton>;

/**
 * Nimiq Pay's "Sign In" connects its injected wallet directly, so the tap
 * opens Nimiq Pay's own connect dialog. The ui-kit button opens RainbowKit's
 * connect modal instead, which on a phone is a sheet with a lone "Browser
 * Wallet" above a "Get a Wallet" pitch: an extra step that reads as being
 * asked to install a wallet.
 */
const NimiqPayLoginButton = ({
  label = "Sign In",
  rightIcon,
}: LoginButtonProps) => {
  const { connect, connectors, isPending, error } = useConnect();

  return (
    <div className="flex flex-col gap-2 [&>*]:w-full">
      <LiftedButton
        onClick={() => {
          const connector = connectors.find((c) => c.id === "injected");
          if (connector) connect({ connector });
        }}
        disabled={isPending}
        rightIcon={rightIcon}
        className="w-full bg-primary-blue"
      >
        {label}
      </LiftedButton>
      {error && error.name !== "UserRejectedRequestError" && (
        <Body className="text-xs text-system-red">
          Couldn&apos;t connect your Nimiq Pay wallet:{" "}
          {(error as BaseError).shortMessage ?? error.message}
        </Body>
      )}
    </div>
  );
};

/** The ui-kit's LoginButton, except signed out in Nimiq Pay (see above). */
const LoginButton = (props: LoginButtonProps) =>
  useWalletHost() === "nimiqpay" && props.status === "NOT_CONNECTED" ? (
    <NimiqPayLoginButton {...props} />
  ) : (
    <UIKitLoginButton {...props} />
  );

export default LoginButton;
