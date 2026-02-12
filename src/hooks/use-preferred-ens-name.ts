import { Address, createPublicClient, fallback, http, toCoinType } from "viem";
import { arbitrum, base, linea, mainnet, optimism, scroll } from "viem/chains";
import { normalize } from "viem/ens";
import { useQuery } from "@tanstack/react-query";
import { formatAddress } from "@/utils/address";

console.log(
  "__ ALCHEMY KEY __",
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_ETHEREUM_MAINNET
);

const mainnetPublicClient = createPublicClient({
  chain: mainnet,
  transport: fallback([
    http(process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_ETHEREUM_MAINNET),
    http("https://ethereum.publicnode.com"),
  ]),
});

const OTHER_CHAINS = [base, optimism, arbitrum, scroll, linea];

const GNOSIS_COIN_TYPE = BigInt(2147483748);

const fetchEnsName = async (address: Address) => {
  if (!address) return null;

  const resolverOptions = {
    universalResolverAddress:
      "0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe" as const,
  };

  try {
    const gnosisName = await mainnetPublicClient.getEnsName({
      address,
      coinType: GNOSIS_COIN_TYPE,
      ...resolverOptions,
    });

    console.log("__ GNOSIS NAME __", gnosisName);

    if (gnosisName) return normalize(gnosisName);
  } catch (err) {
    console.warn("Gnosis ENS lookup failed:", err);
  }

  try {
    const l1Name = await mainnetPublicClient.getEnsName({
      address,
      ...resolverOptions,
    });

    console.log("__ L1 Name __", l1Name);

    if (l1Name) return normalize(l1Name);
  } catch (err) {
    console.warn("L1 ENS lookup failed:", err);
  }

  const otherPromises = OTHER_CHAINS.map(async (chain) => {
    try {
      const name = await mainnetPublicClient.getEnsName({
        address,
        coinType: toCoinType(chain.id),
        ...resolverOptions,
      });

      console.log(`__ ${chain.name} ENS Name __`, name);

      return name ? normalize(name) : null;
    } catch (err) {
      console.warn(`${chain.name} ENS lookup failed:`, err);
      return null;
    }
  });

  try {
    const firstOtherName = await Promise.any(otherPromises);

    if (firstOtherName) return firstOtherName;
  } catch (err) {
    console.warn("Other chains ENS lookup failed:", err);
  }

  return null;
};

export const usePreferredEnsName = ({ address }: { address?: Address }) => {
  const query = useQuery({
    queryKey: ["preferredEnsName", address?.toLowerCase()],
    queryFn: () => fetchEnsName(address!),
    enabled: !!address,
    select: (name) => name || (address ? formatAddress(address) : "N/A"),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    ensName: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
