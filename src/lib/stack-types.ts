/**
 * The stack-type discriminator. Each type is backed by its own contract with
 * its own id-space, creation flow, detail route and Supabase metadata id
 * shape (see stackMetadataId below).
 */
export const STACK_TYPES = ["rosca", "asca", "goal", "collective"] as const;

export type StackType = (typeof STACK_TYPES)[number];

/** The three new stack types (everything except the original ROSCA). */
export type NewStackType = Exclude<StackType, "rosca">;

export const STACK_TYPE_LABELS: Record<StackType, string> = {
  rosca: "Saving stack",
  asca: "Savings & credit fund",
  goal: "Goal savings",
  collective: "Collective fund",
};

export const STACK_TYPE_DESCRIPTIONS: Record<StackType, string> = {
  rosca:
    "Deposit a fixed amount each round and take turns claiming the whole pot.",
  asca: "Save flexible amounts together, earn interest, and borrow against your own savings.",
  goal: "Save together toward a target by a deadline — release to a beneficiary or reclaim your share.",
  collective:
    "Pool money as a community, propose and vote on how to spend it, and leave anytime.",
};

const STACK_TYPE_DETAIL_BASE_PATHS: Record<StackType, string> = {
  rosca: "/stacks",
  asca: "/ascas",
  goal: "/goals",
  collective: "/funds",
};

/** Detail-page path for a stack of the given type, e.g. `/goals/3`. */
export function stackTypeDetailPath(
  type: StackType,
  id: bigint | string
): string {
  return `${STACK_TYPE_DETAIL_BASE_PATHS[type]}/${id}`;
}

/**
 * The stacks_metadata primary key for a stack. ROSCA ids stay bare (their
 * historical shape); the new types are prefixed so ids from different
 * contracts never collide: `asca:<id>`, `goal:<id>`, `collective:<id>`.
 */
export function stackMetadataId(type: StackType, id: bigint | string): string {
  return type === "rosca" ? `${id}` : `${type}:${id}`;
}

/**
 * Parses a stacks_metadata id back into its type and on-chain id.
 * Returns null when the id is not a valid metadata id.
 */
export function parseStackMetadataId(
  metadataId: string
): { type: StackType; onChainId: string } | null {
  const match = /^(?:(asca|goal|collective):)?(\d+)$/.exec(metadataId);
  if (!match) return null;

  const [, prefix, onChainId] = match;
  return { type: (prefix as NewStackType | undefined) ?? "rosca", onChainId };
}

export function isStackType(value: unknown): value is StackType {
  return STACK_TYPES.includes(value as StackType);
}
