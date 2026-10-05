"use client";

import { ReactNode } from "react";
import { Body, Heading3 } from "@breadcoop/ui";
import { DeviceMobileIcon, GlobeIcon } from "@phosphor-icons/react";
import Alert from "@/components/alert";
import LocalButton from "@/components/button";
import CopyCurrentLink from "@/components/copy-current-link";
import { useActiveChainId } from "@/components/providers/active-chain";
import { useIsMiniPayBrowser } from "@/components/providers/is-minipay";
import { getNetwork } from "@/utils/chain";
import { isCeloChain } from "@/utils/celo";

const MINIPAY_SITE_URL = "https://www.opera.com/products/minipay";

/**
 * Celo stacks work only inside MiniPay, and Gnosis stacks only outside it.
 *
 * The pairing is not a style choice: the Privy stack cannot transact on Celo —
 * gas sponsorship is Gnosis-only (`providers/tx-sender.tsx`) and the CIP-64
 * feeCurrency path exists only in the MiniPay sender, so an embedded wallet
 * holding no CELO fails every write. MiniPay in turn has no message signing at
 * all. Rather than let someone reach a stack they cannot act on, say which
 * browser the link belongs in.
 *
 * Rendered from `providers/index.tsx` off the same resolved MiniPay state that
 * picks the provider stack, so the ~500ms `window.ethereum` correction moves
 * both together instead of flashing independently.
 */
const ChainBrowserGuard = ({ children }: { children: ReactNode }) => {
  const chainId = useActiveChainId();
  const isMiniPayBrowser = useIsMiniPayBrowser();
  const chainWantsMiniPay = isCeloChain(chainId);

  if (chainWantsMiniPay === isMiniPayBrowser) return children;

  const chainName = getNetwork(chainId)?.chain.name ?? `chain ${chainId}`;

  const { Icon, title, description, action } = chainWantsMiniPay
    ? {
        Icon: DeviceMobileIcon,
        title: "Open this in MiniPay",
        description: `This stack is on ${chainName}, which Stacks supports inside the MiniPay app only. Copy the link and open it in MiniPay to continue.`,
        action: (
          <LocalButton
            as="a"
            href={MINIPAY_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get MiniPay
          </LocalButton>
        ),
      }
    : {
        Icon: GlobeIcon,
        title: "Open this in your browser",
        description: `This stack is on ${chainName}, which MiniPay's in-app browser cannot sign for. Copy the link and open it in a normal browser to continue.`,
        action: null,
      };

  return (
    <main className="page-layout flex flex-col items-center gap-6 py-16 text-center">
      <Icon size={48} className="fill-primary-blue" />
      <Heading3 className="text-2xl">{title}</Heading3>
      <Body className="max-w-md text-surface-grey">{description}</Body>

      <Alert
        variant="warning"
        closeAble={false}
        title="Why you're seeing this"
        description="Each network works in one place: Celo stacks in MiniPay, Gnosis stacks in a normal browser. Opening a stack in the wrong one means deposits and claims cannot be signed."
        className="max-w-md text-left"
      />

      <div className="flex flex-col items-center gap-3">
        <CopyCurrentLink />
        {action}
      </div>
    </main>
  );
};

export default ChainBrowserGuard;
