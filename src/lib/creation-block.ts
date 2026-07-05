import { clientEnv } from "./env";
import { isLocalMode } from "./network-mode";

interface RequestableClient {
  request(args: { method: string; params?: unknown }): Promise<unknown>;
}

interface AnvilNodeInfo {
  forkConfig?: { forkBlockNumber?: number | null } | null;
}

let cachedLocalCreationBlock: bigint | null = null;

/**
 * Block to scan contract logs from. On Sepolia/Gnosis this is the build-time
 * contract creation block; in local mode it is the Anvil fork block (the local
 * contracts are always deployed after the fork point), memoized per page load.
 */
export async function getCreationBlock(
  publicClient: RequestableClient
): Promise<bigint> {
  if (!isLocalMode())
    return BigInt(clientEnv.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK);

  if (cachedLocalCreationBlock === null) {
    const info = (await publicClient.request({
      method: "anvil_nodeInfo",
    })) as AnvilNodeInfo;
    const forkBlock = info?.forkConfig?.forkBlockNumber;
    cachedLocalCreationBlock =
      forkBlock != null ? BigInt(forkBlock) : BigInt(0);
  }

  return cachedLocalCreationBlock;
}
