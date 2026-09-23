/**
 * The stack-type discriminator. Each type is backed by its own contract with
 * its own id-space, creation flow, detail route and Supabase metadata id
 * shape (see stackMetadataId below).
 */
export const STACK_TYPES = ["rosca", "goal"] as const;

export type StackType = (typeof STACK_TYPES)[number];

/** Every stack type except the original ROSCA. */
export type NewStackType = Exclude<StackType, "rosca">;

export const STACK_TYPE_LABELS: Record<StackType, string> = {
  rosca: "Rotating savings",
  goal: "Shared goal",
};

export const STACK_TYPE_DESCRIPTIONS: Record<StackType, string> = {
  rosca:
    "Deposit a fixed amount each round and take turns claiming the whole pot.",
  goal: "Pool contributions toward a shared target. If the group hits the goal, funds release. If not, everyone gets their money back.",
};

const STACK_TYPE_DETAIL_BASE_PATHS: Record<StackType, string> = {
  rosca: "/stacks",
  goal: "/goals",
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
 * historical shape); the other types are prefixed so ids from different
 * contracts never collide: `goal:<id>`.
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
  const match = /^(?:(goal):)?(\d+)$/.exec(metadataId);
  if (!match) return null;

  const [, prefix, onChainId] = match;
  return { type: (prefix as NewStackType | undefined) ?? "rosca", onChainId };
}

export function isStackType(value: unknown): value is StackType {
  return STACK_TYPES.includes(value as StackType);
}
