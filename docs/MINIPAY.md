# MiniPay (Celo) build

How Stacks runs inside MiniPay's in-app browser, and what the Mini App listing
needs. Background: issue #154. For general architecture see
[ARCHITECTURE.md](./ARCHITECTURE.md).

## How the two builds coexist

One codebase, two provider stacks, chosen at runtime in
`src/components/providers/index.tsx`:

|               | Web build                 | MiniPay build                                            |
| ------------- | ------------------------- | -------------------------------------------------------- |
| Wallet        | Privy embedded / external | MiniPay injected (`window.ethereum`)                     |
| Auth          | Privy access token        | `/api/minipay/session` HMAC JWT off the injected address |
| Chain         | Gnosis (100) / Sepolia    | Celo (42220) / Celo Sepolia (11142220)                   |
| Deposit token | BREAD (18 dec)            | USDT (6 dec), configurable                               |
| Gas           | Privy sponsorship         | CIP-64 `feeCurrency`, paid in the stablecoin             |

The MiniPay stack mounts only when **both** hold: the browser is MiniPay, and
`NEXT_PUBLIC_CHAIN_ID` is a Celo chain. A Gnosis deployment opened inside
MiniPay keeps the Privy stack.

Detection is seeded server-side from the user agent (`isServerMiniPay()`), so
SSR and the first client render agree, then confirmed against
`window.ethereum.isMiniPay`. Consumers read the resolved value from
`useIsMiniPay()` (`src/components/providers/is-minipay.tsx`) — **not** from a
`window` check in an effect, which would be false on the first render and
briefly mount the wrong branch.

Both stacks are `next/dynamic` imports, so each client downloads only the one
it uses.

## Constraints MiniPay imposes

- **No message signing.** `personal_sign` and `eth_signTypedData` are
  unsupported. No SIWE, no EIP-712 invite links — members are added on-chain
  with `addMembers` instead (`src/components/add-members/`).
- **No connect button.** The wallet auto-connects on load.
- **Stablecoins only.** USDT / USDC / USDm — never show CELO. USDT and USDC are
  6-decimal; every amount goes through `formatDepositAmount` /
  `parseDepositAmount` (`src/lib/deposit-token.ts`).
- **`feeCurrency` uses adapter addresses** for USDT/USDC, not the token address
  (`src/utils/celo.ts`). MiniPay may override it with whatever stablecoin the
  user holds most of, so treat it as a hint.
- **Copy:** "Network fee", "Deposit", "Withdraw", "Stablecoin". Not gas,
  onramp, offramp, or crypto.
- Minimum viewport 360×640.

## Testing

Physical Android/iOS device only — no emulators.

1. `pnpm dev`, exposed over HTTPS (ngrok or similar).
2. In MiniPay: Settings → About → tap the version repeatedly to enable
   Developer Mode.
3. Developer Mode → "Load Test Page" → paste the tunnel URL.

## Network manifest

Every origin the app contacts, for the submission form.

**Core**

| Origin                                | Purpose                                          |
| ------------------------------------- | ------------------------------------------------ |
| `<your-supabase-ref>.supabase.co`     | Stack metadata, profiles (per environment)       |
| `forno.celo.org`                      | Celo mainnet RPC (viem default)                  |
| `forno.celo-sepolia.celo-testnet.org` | Celo Sepolia RPC                                 |
| `link.minipay.xyz`                    | Add Cash deeplink                                |
| `celoscan.io`                         | Transaction/contract links                       |
| `celo-sepolia.blockscout.com`         | Testnet explorer links                           |
| `spoo.me`                             | Invite-link shortening (web build only)          |
| `auth.privy.io`                       | Privy JWKS — server-side token verification only |

**Web-build only** (not loaded in MiniPay, since the Privy stack is
code-split): `*.privy.io`, WalletConnect relays, `docs.li.fi` and LiFi
endpoints, `dune.com`, `ethereum.publicnode.com`.

**Static/outbound links** (footer and content, no data exchanged):
`app.breadchain.xyz`, `docs.bread.coop`, `fund.bread.coop`,
`stacks.bread.coop`, `www.sourdough.systems`, `github.com`,
`opencollective.com`, `giveth.io`, `discord.com`, `farcaster.xyz`, `x.com`,
`www.linkedin.com`, `www.youtube.com`, `forms.gle`, `form.typeform.com`,
`docs.google.com`, calendar links (`calendar.google.com`,
`calendar.yahoo.com`, `outlook.cloud.microsoft`).

> Regenerate with:
> `grep -rhoE "https://[a-zA-Z0-9.-]+\.[a-z]{2,}" src/ --include=*.ts --include=*.tsx | sort -u`

## Submission checklist

Form: <https://developer.minipay.to/mini-app-listing>

- [x] Zero-click connect, no signature prompts in the MiniPay path
- [x] Celo mainnet support
- [x] HTTPS
- [x] 512×512 icon (`public/web-app-manifest-512x512.png`)
- [x] Dependency security — `minimumReleaseAge`, `strictDepBuilds` +
      `allowBuilds` allowlist, committed lockfile, `--frozen-lockfile` installs
      (see note below)
- [ ] **Terms of Service URL** — not yet in-app
- [ ] **Privacy Policy URL** — not yet in-app
- [ ] **Support URL** + 24h critical-fix SLA — not yet in-app
- [ ] App name, tagline, publisher, category, production App URL
- [ ] Contracts verified on Celoscan + one sample transaction link per
      user-facing method (deployment now lives in the `saving-circles` repo —
      record the deployed addresses here)
- [ ] PageSpeed Insights score for the production URL (mobile)
- [ ] Responsive check at 360×640

### Note on dependency pinning

MiniPay's checklist asks for exact versions in `package.json`. This repo keeps
caret ranges plus a committed `pnpm-lock.yaml` and `--frozen-lockfile`
installs, which pins every package — transitive ones included — more
completely than the manifest can.

Pinning the manifest was attempted and reverted: changing the specifiers forces
a full lockfile re-resolution, which trips `trustPolicy: no-downgrade` on
several transitive packages (`undici-types`, `ua-parser-js`, `slow-redact`,
`@noble/hashes`, …). Satisfying the letter of the checklist would mean adding
each to `trustPolicyExclude` — weakening a supply-chain guard, including on a
crypto library, to gain nothing the lockfile does not already provide. If a
reviewer insists, bump the offending direct dependencies rather than widening
the exclude list.

Likewise `ignore-scripts=true` is **not** set: pnpm 11's `strictDepBuilds` +
`allowBuilds` already blocks dependency build scripts by default with an
explicit allowlist, and a blanket flag would break the five packages that
legitimately need to build.
