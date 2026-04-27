import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { clientEnv } from "@/lib/env";
import { formatAddress } from "@/utils/address";
import { networks } from "@/utils/network";
import { Body, CopyButtonIcon } from "@breadcoop/ui";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { ReactNode } from "react";
import { Address } from "viem";

const StackInfoRow = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => {
  return (
    <div className="bg-paper-1 py-2 px-6 flex items-center justify-between mb-[0.6875rem] last:mb-0">
      <Body>{label}</Body>
      <div>{children}</div>
    </div>
  );
};

const StackInfo = ({ owner }: { owner: Address }) => {
  return (
    <div className="mt-6.5">
      <StackInfoRow label="Contract:">
        <a
          href={`${networks[clientEnv.NEXT_PUBLIC_CHAIN_ID as keyof typeof networks]}/${SAVING_CIRCLES_CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-end gap-1"
        >
          {formatAddress(SAVING_CIRCLES_CONTRACT_ADDRESS)}
          <ArrowUpRightIcon size={24} className="fill-blue-2" />
        </a>
      </StackInfoRow>
      <StackInfoRow label="Created by:">
        <Body className="flex items-center justify-end gap-1">
          {formatAddress(owner)}
          <CopyButtonIcon textToCopy={owner} />
          {/* <CopyButton
            textToCopy={owner}
            varaint="icon"
            className="flex items-center justify-end gap-1"
          >
            <CopyIcon size={24} className="fill-blue-2" />
          </CopyButton> */}
        </Body>
      </StackInfoRow>
    </div>
  );
};

export default StackInfo;
