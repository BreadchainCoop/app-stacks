import { Address } from "viem";

/**
 * Circles hidden from the public list on the homepage.
 *
 * Both lists are maintained by hand. Do not derive them from a circle's
 * members: `create()` takes the owner from calldata without checking it against
 * `msg.sender`, so anyone can plant a real user's address on a spam circle.
 * Expanding a block through membership would let them use that to hide an
 * innocent user's own circles.
 */
export const BLOCKED_CIRCLE_IDS: ReadonlySet<string> = new Set<string>([]);

/**
 * Lowercased owner addresses. One entry covers every circle that owner created,
 * which is usually the whole batch from a single spammer.
 */
export const BLOCKED_OWNERS: ReadonlySet<string> = new Set<string>([]);

export function isBlockedCircle(id: bigint, owner: Address): boolean {
  return (
    BLOCKED_CIRCLE_IDS.has(id.toString()) ||
    BLOCKED_OWNERS.has(owner.toLowerCase())
  );
}
