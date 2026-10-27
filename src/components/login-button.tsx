"use client";

import { ComponentProps, ReactNode } from "react";
import {
  Body,
  LiftedButton,
  LoginButton as UIKitLoginButton,
} from "@breadcoop/ui";
import { BaseError, useChains, useConnect, useSwitchChain } from "wagmi";
import { useWalletHost } from "@/components/providers/is-minipay";
import { useActiveChainId } from "@/components/providers/active-chain";

type LoginButtonProps = ComponentProps<typeof UIKitLoginButton>;

/**
 * A tap that opens one Nimiq Pay dialog, with the reason underneath when the
 * request fails rather than being cancelled.
 */
const NimiqPayButton = ({
  children,
  rightIcon,
  onClick,
  isPending,
  error,
  failure,
}: {
  children: ReactNode;
  rightIcon?: ReactNode;
  onClick: () => void;
  isPending: boolean;
  error: Error | null;
  failure: string;
}) => (
  <div className="flex flex-col gap-2 [&>*]:w-full">
    <LiftedButton
      onClick={onClick}
      disabled={isPending}
      rightIcon={rightIcon}
      className="w-full bg-primary-blue"
    >
      {children}
    </LiftedButton>
    {error && error.name !== "UserRejectedRequestError" && (
      <Body className="text-xs text-system-red">
        {failure}: {(error as BaseError).shortMessage ?? error.message}
      </Body>
    )}
  </div>
);

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
    <NimiqPayButton
      onClick={() => {
        const connector = connectors.find((c) => c.id === "injected");
        if (connector) connect({ connector });
      }}
      isPending={isPending}
      error={error}
      failure="Couldn't connect your Nimiq Pay wallet"
      rightIcon={rightIcon}
    >
      {label}
    </NimiqPayButton>
  );
};

/**
 * Nimiq Pay forgets the connection on every page load and reconnects on
 * Ethereum, so a visit lands here right after Sign In. Switching is a
 * confirmed request like any other, so it gets its own tap, straight to the
 * page's chain; the ui-kit button opens RainbowKit's network list first.
 */
const NimiqPaySwitchChainButton = () => {
  const chainId = useActiveChainId();
  const chain = useChains().find((c) => c.id === chainId);
  const { switchChain, isPending, error } = useSwitchChain();

  return (
    <NimiqPayButton
      onClick={() => switchChain({ chainId })}
      isPending={isPending}
      error={error}
      failure="Couldn't switch networks"
    >
      Switch to {chain?.name ?? "this network"}
    </NimiqPayButton>
  );
};

/** The ui-kit's LoginButton, except in Nimiq Pay (see above). */
const LoginButton = (props: LoginButtonProps) => {
  const isNimiqPay = useWalletHost() === "nimiqpay";

  if (isNimiqPay && props.status === "NOT_CONNECTED") {
    return <NimiqPayLoginButton {...props} />;
  }

  if (isNimiqPay && props.status === "UNSUPPORTED_CHAIN") {
    return <NimiqPaySwitchChainButton />;
  }

  return <UIKitLoginButton {...props} />;
};

export default LoginButton;
