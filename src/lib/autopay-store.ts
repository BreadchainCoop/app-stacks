import {
  AutopayAuthorizationRecord,
  AutopayExecutionResult,
} from "@/lib/autopay";
import { serverEnv } from "@/lib/envs/server";
import { Redis } from "@upstash/redis";
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
const AUTOPAY_REDIS_KEY = "autopay:state";

let redisClient: Redis | null | undefined;

function getRedisClient() {
  if (redisClient !== undefined) {
    return redisClient;
  }

  if (
    !serverEnv.UPSTASH_REDIS_REST_URL ||
    !serverEnv.UPSTASH_REDIS_REST_TOKEN
  ) {
    redisClient = null;
    return redisClient;
  }

  redisClient = new Redis({
    url: serverEnv.UPSTASH_REDIS_REST_URL,
    token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
  });

  return redisClient;
}

async function ensureStoreDir() {
  await mkdir(AUTOPAY_STORE_DIR, { recursive: true });
}

export async function readAutopayStore(): Promise<AutopayStore> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const parsed = await redis.get<Partial<AutopayStore>>(AUTOPAY_REDIS_KEY);

      return {
        authorizations: parsed?.authorizations ?? {},
        results: parsed?.results ?? {},
      };
    } catch {
      return EMPTY_STORE;
    }
  }

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
  const redis = getRedisClient();

  if (redis) {
    await redis.set(AUTOPAY_REDIS_KEY, store);
    return;
  }

  await ensureStoreDir();
  await writeFile(AUTOPAY_STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export { AUTOPAY_STORE_PATH };
