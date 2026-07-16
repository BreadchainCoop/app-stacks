import { Body, formatBalance } from "@breadcoop/ui";
import { Address, erc20Abi } from "viem";
import { useReadContract } from "wagmi";
import { DEPOSIT_TOKEN, formatDepositAmount } from "@/lib/deposit-token";
import { getDefaultChainId } from "@/utils/chain";

const StacksBalance = ({ address }: { address: Address }) => {
  // Read directly instead of @breadcoop/ui's useBreadBalance, which hardcodes
  // 18 decimals and misreports 6-decimal deposit tokens (USDT/USDC on Celo).
  const { data } = useReadContract({
    address: DEPOSIT_TOKEN.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
    chainId: getDefaultChainId(),
    query: { enabled: Boolean(address) },
  });

  return (
    <Body className="text-surface-grey text-xs">
      Stacks account Balance: $
      {formatBalance(parseFloat(formatDepositAmount(data ?? BigInt(0))))}
    </Body>
  );
};

export default StacksBalance;
