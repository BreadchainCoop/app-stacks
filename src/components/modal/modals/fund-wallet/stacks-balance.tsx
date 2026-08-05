import { formatAmount } from "@/utils/format-amount";
import { Body, useBreadBalance } from "@breadcoop/ui";
import { Address } from "viem";

const StacksBalance = ({ address }: { address: Address }) => {
  const { BREAD } = useBreadBalance({ address });

  return (
    <Body className="text-surface-grey text-xs">
      Stacks account Balance: ${formatAmount(parseFloat(BREAD))}
    </Body>
  );
};

export default StacksBalance;
