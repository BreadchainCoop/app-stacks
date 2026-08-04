/* Shared harness lib: app addresses, the app's OWN ABIs, viem clients, the
 * Node-side signers that back the injected wallets, anvil cheatcodes, and the
 * independent on-chain reads every assertion is made against.
 *
 * The signing keys are read from env (or the public anvil dev defaults) and
 * never leave this Node process — the browser only ever sees an EIP-1193
 * proxy (see inject.cjs).
 */
const fs = require("fs");
const path = require("path");
const {
  createPublicClient,
  createWalletClient,
  defineChain,
  decodeEventLog,
  erc20Abi,
  http,
} = require("viem");
const { privateKeyToAccount } = require("viem/accounts");

const APP_ROOT = path.resolve(__dirname, "../..");

/* ------------------------------------------------------------------ env --- */

/** Parse a dotenv file into a plain object (no interpolation, no export). */
function readEnvFile(file) {
  const out = {};
  let raw;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch {
    return out;
  }
  for (const line of raw.split("\n")) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    )
      value = value.slice(1, -1);
    out[m[1]] = value;
  }
  return out;
}

// Contract addresses come from the app's own .env.local, so the harness always
// targets exactly what the running dev server targets.
const appEnv = readEnvFile(path.join(APP_ROOT, ".env.local"));

const RPC = process.env.TEST_RPC_URL || "http://localhost:8545";
const BASE = process.env.TEST_BASE_URL || "http://localhost:3001";
const CHAIN_ID = Number(
  process.env.TEST_CHAIN_ID || appEnv.NEXT_PUBLIC_CHAIN_ID || 31337
);

// Public anvil dev keys. They are funded only on the local fork and are
// intentionally not secrets — never point this at a real network.
const KEYS = {
  admin:
    process.env.TEST_ADMIN_KEY ||
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  owner:
    process.env.TEST_OWNER_KEY ||
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  member:
    process.env.TEST_MEMBER_KEY ||
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
};

const A = {
  bread: appEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS,
  asca: appEnv.NEXT_PUBLIC_ASCA_CONTRACT_ADDRESS,
  goal: appEnv.NEXT_PUBLIC_GOAL_SAVINGS_CONTRACT_ADDRESS,
  collective: appEnv.NEXT_PUBLIC_COLLECTIVE_FUND_CONTRACT_ADDRESS,
};

// A third party that is never a member: proposal recipient / goal beneficiary.
const OUTSIDER = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"; // anvil #3

/* ------------------------------------------------------------------ abi --- */

/**
 * Load an ABI straight out of the app's own `src/lib/abis/*.ts`. Using the
 * app's ABI (rather than a copy) is deliberate: if the app's ABI ever drifts
 * from the deployed contract, these assertions break instead of silently
 * testing a stale copy.
 */
function loadAbi(moduleName) {
  const file = path.join(APP_ROOT, "src/lib/abis", `${moduleName}.ts`);
  const src = fs.readFileSync(file, "utf8");
  const start = src.indexOf("[");
  const end = src.lastIndexOf("]");
  if (start < 0 || end < 0) throw new Error(`no ABI array in ${file}`);
  // The file is a plain TS array literal (`export const x = [...] as const;`),
  // so the array slice is valid JS once the type assertion is dropped.
  return new Function(`return ${src.slice(start, end + 1)};`)();
}

const abis = {
  asca: loadAbi("accumulating-saving-circles"),
  goal: loadAbi("goal-saving-circles"),
  collective: loadAbi("collective-fund-circles"),
};

/* -------------------------------------------------------------- clients --- */

const chain = defineChain({
  id: CHAIN_ID,
  name: "Anvil (Gnosis fork)",
  nativeCurrency: { name: "xDAI", symbol: "xDAI", decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
});

const pub = createPublicClient({ chain, transport: http(RPC) });

/**
 * A Node-side signer plus the EIP-1193 handler the in-page shim proxies to.
 * `handle` is the ONLY bridge to the key, and it lives in this process.
 */
function makeSigner(privateKey) {
  const account = privateKeyToAccount(privateKey);
  const wallet = createWalletClient({ account, chain, transport: http(RPC) });

  async function handle(method, params = []) {
    switch (method) {
      case "eth_requestAccounts":
      case "eth_accounts":
        return [account.address];
      case "eth_chainId":
        return "0x" + CHAIN_ID.toString(16);
      case "net_version":
        return String(CHAIN_ID);
      case "personal_sign":
        return wallet.signMessage({ account, message: { raw: params[0] } });
      case "eth_sign":
        return wallet.signMessage({ account, message: { raw: params[1] } });
      case "eth_signTypedData_v4": {
        const typed =
          typeof params[1] === "string" ? JSON.parse(params[1]) : params[1];
        return wallet.signTypedData({ account, ...typed });
      }
      case "eth_sendTransaction": {
        const tx = params[0];
        return wallet.sendTransaction({
          account,
          to: tx.to,
          data: tx.data,
          value: tx.value ? BigInt(tx.value) : undefined,
          gas: tx.gas ? BigInt(tx.gas) : undefined,
        });
      }
      case "wallet_switchEthereumChain":
      case "wallet_addEthereumChain":
      case "wallet_revokePermissions":
        return null;
      case "wallet_requestPermissions":
        return [
          {
            parentCapability: "eth_accounts",
            caveats: [{ type: "restricted", value: [account.address] }],
          },
        ];
      default:
        return pub.request({ method, params });
    }
  }

  return { account, wallet, handle };
}

const admin = makeSigner(KEYS.admin);
const owner = makeSigner(KEYS.owner);
const member = makeSigner(KEYS.member);

/* ---------------------------------------------------------------- reads --- */

const read = (address, abi, functionName, args = []) =>
  pub.readContract({ address, abi, functionName, args });

/** Independent on-chain reads used for assertions (never via the app). */
const R = {
  breadBalance: (who) => read(A.bread, erc20Abi, "balanceOf", [who]),

  asca: {
    nextId: () => read(A.asca, abis.asca, "nextId"),
    getFund: (id) => read(A.asca, abis.asca, "getFund", [id]),
    members: (id) => read(A.asca, abis.asca, "getFundMembers", [id]),
    isMember: (id, who) => read(A.asca, abis.asca, "isMember", [id, who]),
    usedNonce: (id, nonce) =>
      read(A.asca, abis.asca, "usedNonces", [id, nonce]),
    savings: (id, who) => read(A.asca, abis.asca, "savings", [id, who]),
    balances: (id) => read(A.asca, abis.asca, "getFundBalances", [id]),
    loan: (id, who) => read(A.asca, abis.asca, "getLoan", [id, who]),
    pendingInterest: (id, who) =>
      read(A.asca, abis.asca, "pendingInterestOf", [id, who]),
    accPerShare: (id) => read(A.asca, abis.asca, "accInterestPerShare", [id]),
    creditLine: (id, who) => read(A.asca, abis.asca, "creditLineOf", [id, who]),
  },

  goal: {
    nextId: () => read(A.goal, abis.goal, "nextId"),
    getGoal: (id) => read(A.goal, abis.goal, "getGoal", [id]),
    members: (id) => read(A.goal, abis.goal, "getGoalMembers", [id]),
    isMember: (id, who) => read(A.goal, abis.goal, "isMember", [id, who]),
    usedNonce: (id, nonce) =>
      read(A.goal, abis.goal, "usedNonces", [id, nonce]),
    contribution: (id, who) =>
      read(A.goal, abis.goal, "contributions", [id, who]),
    totalDeposited: (id) => read(A.goal, abis.goal, "totalDeposited", [id]),
    reached: (id) => read(A.goal, abis.goal, "goalReached", [id]),
    released: (id) => read(A.goal, abis.goal, "released", [id]),
    state: (id) => read(A.goal, abis.goal, "goalState", [id]),
  },

  collective: {
    nextId: () => read(A.collective, abis.collective, "nextId"),
    getFund: (id) => read(A.collective, abis.collective, "getFund", [id]),
    members: (id) =>
      read(A.collective, abis.collective, "getFundMembers", [id]),
    isMember: (id, who) =>
      read(A.collective, abis.collective, "isMember", [id, who]),
    memberIndex: (id, who) =>
      read(A.collective, abis.collective, "memberIndex", [id, who]),
    usedNonce: (id, nonce) =>
      read(A.collective, abis.collective, "usedNonces", [id, nonce]),
    shares: (id, who) =>
      read(A.collective, abis.collective, "sharesOf", [id, who]),
    proposal: (id, pid) =>
      read(A.collective, abis.collective, "getProposal", [id, pid]),
    proposalState: (id, pid) =>
      read(A.collective, abis.collective, "proposalState", [id, pid]),
    hasVoted: (id, pid, who) =>
      read(A.collective, abis.collective, "hasVoted", [id, pid, who]),
    previewWithdraw: (id, who) =>
      read(A.collective, abis.collective, "previewWithdraw", [id, who]),
  },
};

/**
 * Find the newest matching event emitted by `address` in recent blocks and
 * decode it with the app's ABI — proof the UI's transaction produced it.
 */
async function findEvent({ address, abi, eventName, fromBlock, match }) {
  const latest = await pub.getBlockNumber();
  const from =
    fromBlock !== undefined
      ? BigInt(fromBlock)
      : latest > 200n
        ? latest - 200n
        : 0n;
  const logs = await pub.getLogs({ address, fromBlock: from, toBlock: latest });
  for (let i = logs.length - 1; i >= 0; i--) {
    let decoded;
    try {
      decoded = decodeEventLog({
        abi,
        data: logs[i].data,
        topics: logs[i].topics,
      });
    } catch {
      continue;
    }
    if (decoded.eventName !== eventName) continue;
    if (match && !match(decoded.args)) continue;
    return { args: decoded.args, log: logs[i] };
  }
  return null;
}

/* ------------------------------------------------------------- anvil ------ */

const hex = (n) => "0x" + BigInt(n).toString(16);
const rpc = (method, params = []) =>
  fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
  })
    .then((r) => r.json())
    .then((j) => {
      if (j.error) throw new Error(`${method}: ${j.error.message}`);
      return j.result;
    });

const fork = {
  setBalance: (who, wei) => rpc("anvil_setBalance", [who, hex(wei)]),
  mine: () => rpc("evm_mine", []),
  blockTimestamp: async () => (await pub.getBlock()).timestamp,
  /** Warp forward and mine, so time-dependent contract state advances. */
  async increaseTime(seconds) {
    await rpc("evm_increaseTime", [Number(seconds)]);
    await rpc("evm_mine", []);
    return fork.blockTimestamp();
  },
  /** Top up a wallet with gas and BREAD from the admin account. */
  async fund(who, { eth = 100n, bread = 500n } = {}) {
    await fork.setBalance(who, eth * 10n ** 18n);
    const hash = await admin.wallet.writeContract({
      address: A.bread,
      abi: erc20Abi,
      functionName: "transfer",
      args: [who, bread * 10n ** 18n],
    });
    await pub.waitForTransactionReceipt({ hash });
  },
};

/* -------------------------------------------------------- assertions ------ */

const state = { pass: 0, fail: 0 };

const ok = (cond, message) => {
  if (cond) {
    state.pass++;
    console.log("    \x1b[32m✓\x1b[0m " + message);
  } else {
    state.fail++;
    console.log("    \x1b[31m✗ FAIL\x1b[0m " + message);
  }
  return !!cond;
};

const head = (title) => console.log("\n" + title);

/** Poll `fn` until `pred` holds (on-chain state settles asynchronously). */
async function waitFor(fn, pred, ms = 60000, every = 1000) {
  const started = Date.now();
  let value;
  while (Date.now() - started < ms) {
    value = await fn().catch(() => undefined);
    if (value !== undefined && pred(value)) return value;
    await new Promise((r) => setTimeout(r, every));
  }
  return value;
}

function finish(name) {
  const good = state.fail === 0;
  console.log(
    `\n=== ${name}: ${
      good ? "\x1b[32mALL ASSERTIONS PASS\x1b[0m" : "\x1b[31mFAILED\x1b[0m"
    } (${state.pass} ok, ${state.fail} fail) ===`
  );
  return good ? 0 : 1;
}

const ONE = 10n ** 18n;
const eth = (n) => BigInt(Math.round(Number(n) * 1e6)) * 10n ** 12n;
const same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();

module.exports = {
  A,
  BASE,
  CHAIN_ID,
  KEYS,
  ONE,
  OUTSIDER,
  R,
  RPC,
  abis,
  admin,
  appEnv,
  chain,
  erc20Abi,
  eth,
  findEvent,
  finish,
  fork,
  head,
  member,
  ok,
  owner,
  pub,
  read,
  rpc,
  same,
  state,
  waitFor,
};
