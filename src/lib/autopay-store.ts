import {
  AutopayAuthorizationRecord,
  AutopayExecutionResult,
} from "@/lib/autopay";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

type AutopayStore = {
  authorizations: Record<string, AutopayAuthorizationRecord>;
  results: Record<string, AutopayExecutionResult>;
};

const EMPTY_STORE: AutopayStore = {
  authorizations: {},
  results: {},
};

const AUTOPAY_STORE_DIR = path.join(process.cwd(), ".autopay-data");
const AUTOPAY_STORE_PATH = path.join(AUTOPAY_STORE_DIR, "autopay-state.json");

async function ensureStoreDir() {
  await mkdir(AUTOPAY_STORE_DIR, { recursive: true });
}

export async function readAutopayStore(): Promise<AutopayStore> {
  try {
    const raw = await readFile(AUTOPAY_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<AutopayStore>;

    return {
      authorizations: parsed.authorizations ?? {},
      results: parsed.results ?? {},
    };
  } catch {
    return EMPTY_STORE;
  }
}

export async function writeAutopayStore(store: AutopayStore) {
  await ensureStoreDir();
  await writeFile(AUTOPAY_STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export { AUTOPAY_STORE_PATH };
