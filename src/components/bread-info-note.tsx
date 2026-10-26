"use client";

import { Body } from "@breadcoop/ui";
import { InfoIcon } from "@phosphor-icons/react";
import { ReactNode } from "react";
import { LINKS } from "@/constants/links";
import { useActiveChainId } from "@/components/providers/active-chain";
import { isStablecoinChain } from "@/utils/chain";

/**
 * Informational note explaining that amounts are BREAD (a USD-pegged token on
 * Gnosis), shown on the deposit/withdraw flows to reduce confusion now that the
 * UI displays USD. Links the BREAD token docs for the technical details.
 * Renders nothing on the stablecoin chains (Celo, Polygon), which hold no BREAD.
 */
const BreadInfoNote = ({ children }: { children: ReactNode }) => {
  const chainId = useActiveChainId();

  if (isStablecoinChain(chainId)) return null;

  return (
    <div className="flex items-start gap-2 bg-paper-1 p-3">
      <InfoIcon
        size={20}
        weight="fill"
        className="mt-0.5 shrink-0 text-primary-blue"
      />
      <Body className="text-xs text-surface-grey-2">
        {children}{" "}
        <a
          href={LINKS.docsBreadToken}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-primary-blue underline"
        >
          Learn more about BREAD &amp; xDAI
        </a>
      </Body>
    </div>
  );
};

export default BreadInfoNote;
