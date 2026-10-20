"use client";

import { Body } from "@breadcoop/ui";
import { ArrowRightIcon } from "@phosphor-icons/react";
import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import {
  useEmbeddedWalletAddress,
  useLinkedExternalWallet,
} from "@/hooks/use-linked-external-wallet";
import { useEmbeddedWalletBalances } from "@/hooks/use-embedded-wallet-balances";
import { useHasTransferredToWallet } from "@/hooks/use-has-transferred-to-wallet";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletHost } from "@/components/providers/is-minipay";

/**
 * Moving funds from a Privy embedded wallet to a linked external one. Privy
 * only: in MiniPay and Nimiq Pay the host *is* the wallet, so there is nothing
 * to migrate, and their stacks mount no PrivyProvider.
 *
 * Split in two so the Privy hooks below are never *called* outside the Privy
 * stack. `usePrivy()` happens to tolerate a missing provider today — it reads
 * a default context rather than throwing — but that is not a guarantee: other
 * Privy hooks (`useSyncJwtBasedAuthState`) do throw without one. Relying on
 * the empty context would make those builds hostage to that.
 */
const MigrateAndTransferBanner = () => {
  const walletHost = useWalletHost();

  if (walletHost !== "privy") return null;

  return <PrivyMigrateAndTransferBanner />;
};

const PrivyMigrateAndTransferBanner = () => {
  const { user: privyUser } = usePrivy();
  const { setModal } = useModal();
  const embeddedWallet = useEmbeddedWalletAddress();
  const externalWallet = useLinkedExternalWallet();
  const { hasFunds } = useEmbeddedWalletBalances(embeddedWallet);
  const { data: hasTransferred } = useHasTransferredToWallet(privyUser?.id);

  const hasFundsToMove = hasFunds && hasTransferred === false;

  const shouldShow =
    Boolean(embeddedWallet) && Boolean(externalWallet) && hasFundsToMove;

  if (!shouldShow || !embeddedWallet || !externalWallet) return null;

  return (
    <div className="w-full bg-system-warning">
      <div className="page-layout flex flex-wrap items-center justify-center gap-3 py-3 text-center md:justify-between">
        <Body className="text-paper-main">
          Transfer to your linked wallet — you have funds in your app wallet.
        </Body>
        <LocalButton
          size="sm"
          className="bg-paper-main text-system-warning font-bold shrink-0"
          rightIcon={<ArrowRightIcon size={16} />}
          onClick={() =>
            setModal({
              type: "MIGRATE_AND_TRANSFER",
              embeddedAddress: embeddedWallet,
              externalAddress: externalWallet,
            })
          }
        >
          Transfer funds
        </LocalButton>
      </div>
    </div>
  );
};

export default MigrateAndTransferBanner;
