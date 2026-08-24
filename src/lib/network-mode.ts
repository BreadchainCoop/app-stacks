import { clientEnv } from "./env";

export type NetworkMode = "sepolia" | "local";

const MODE_STORAGE_KEY = "stacks.network-mode";
const ACCOUNT_STORAGE_KEY = "stacks.local-account-index";

/** The 10 well-known Anvil dev accounts (unlocked, pre-funded). */
export const LOCAL_ANVIL_ACCOUNTS = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
  "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
  "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
  "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
  "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
] as const;

const env = clientEnv.NEXT_PUBLIC_NODE_ENV;

/** Runtime mode selection is only offered on dev/demo (never production). */
export const isModeSelectable = env === "development" || env === "demo";

function readStoredMode(): NetworkMode | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(MODE_STORAGE_KEY);
  return value === "local" || value === "sepolia" ? value : null;
}

/**
 * Read synchronously at module scope so every module-scope ternary
 * (constants, wagmi config, supabase client) resolves consistently for the
 * lifetime of the page. Changing mode reloads the page (see setNetworkMode).
 * During SSR this is null and the build-time (Sepolia) values apply.
 */
export const storedNetworkMode: NetworkMode | null = readStoredMode();

export function isLocalMode(): boolean {
  if (env === "local") return true;
  return isModeSelectable && storedNetworkMode === "local";
}

export function setNetworkMode(mode: NetworkMode): void {
  window.localStorage.setItem(MODE_STORAGE_KEY, mode);
  window.location.reload();
}

function readStoredAccountIndex(): number {
  if (typeof window === "undefined") return 0;
  const parsed = Number(window.localStorage.getItem(ACCOUNT_STORAGE_KEY));
  return Number.isInteger(parsed) &&
    parsed >= 0 &&
    parsed < LOCAL_ANVIL_ACCOUNTS.length
    ? parsed
    : 0;
}

export function getLocalAccountIndex(): number {
  return readStoredAccountIndex();
}

export function setLocalAccountIndex(index: number): void {
  window.localStorage.setItem(ACCOUNT_STORAGE_KEY, String(index));
  window.location.reload();
}

export function getLocalAccount(): (typeof LOCAL_ANVIL_ACCOUNTS)[number] {
  return LOCAL_ANVIL_ACCOUNTS[getLocalAccountIndex()];
}
