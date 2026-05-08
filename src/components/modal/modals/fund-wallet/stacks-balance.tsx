import { Body, formatBalance, useBreadBalance } from "@breadcoop/ui";
import { Address } from "viem";

const StacksBalance = ({ address }: { address: Address }) => {
  const { BREAD } = useBreadBalance({ address });

  return (
    <Body className="text-surface-grey text-xs">
      Stacks account Balance: ${formatBalance(parseFloat(BREAD))}
    </Body>
  );
};

export default StacksBalance;
