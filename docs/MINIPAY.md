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
| Chain         | `?chain=gnosis`/`sepolia` | `?chain=celo`/`celo-sepolia`                             |
| Deposit token | BREAD (18 dec)            | USDT (6 dec), configurable                               |
| Gas           | Privy sponsorship         | CIP-64 `feeCurrency`, paid in the stablecoin             |

The MiniPay stack mounts only when **both** hold: the browser is MiniPay, and
the active chain (from `?chain=`) is a Celo chain.

**The two are meant to pair one-to-one**: Celo works only inside MiniPay, and
every other chain only outside it. When a URL names a chain the current browser
can't serve, `ChainBrowserGuard`
(`src/components/chain-browser-guard.tsx`) replaces the app with an instruction
screen rather than letting the user reach a stack they cannot act on. Writes are
genuinely impossible in both directions: the Privy sender has no CIP-64
`feeCurrency` path and sponsors gas only on Gnosis
(`src/components/providers/tx-sender.tsx`), so an embedded wallet holding no CELO
fails every Celo write; and MiniPay cannot sign messages at all.

A URL that names no chain falls back to the browser — MiniPay gets the first
configured Celo chain — so a MiniPay user landing on a bare path gets the Celo
branch without a redirect. That fallback lives in
`src/components/providers/index.tsx`; there is no middleware.

**The pairing is split across two sites.** The web site (`stacks.bread.coop`)
configures only the Privy chain, and the mini site (`mini.stacks.bread.coop`)
only Celo; dev mirrors this on `development.` and `mini-development.`. The mini
site builds the `mini` / `mini-development` branches, which
`.github/workflows/sync-mini-branches.yml` mirrors from `main` / `development`
on every push, so both run the same code against the same Supabase project. A Celo link that reaches the
web site, such as one shared before the split, would otherwise fall back to the
web site's chain and open an unrelated stack with the same id. So each site
redirects a `?chain=` it doesn't configure to that chain's site, as listed in
`CHAIN_SITES` (`src/lib/chain-sites.ts`; see
[ARCHITECTURE.md](./ARCHITECTURE.md)).

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

Every origin the mini site (`https://mini.stacks.bread.coop`) uses, for the
submission form. Recorded on 2026-10-30 by loading the live site in a 360×640
browser with a MiniPay user agent and an injected MiniPay provider, plus every
link in `src/` and in `@breadcoop/ui` (which renders the footer).

**Requested by the page**

| Origin                             | Purpose                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `mini.stacks.bread.coop`           | The app itself: pages, JS, CSS, fonts, images and its `/api` routes        |
| `vsmzhxyeytgktpsjlspe.supabase.co` | Supabase (production): stack metadata, profiles                            |
| `forno.celo.org`                   | Celo mainnet RPC (viem default)                                            |
| `eth-mainnet.g.alchemy.com`        | Ethereum mainnet RPC for ENS names (`src/hooks/use-preferred-ens-name.ts`) |
| `ethereum.publicnode.com`          | Fallback for the ENS RPC above                                             |
| `lb.drpc.org`, `scroll.3668.io`    | ENS offchain-lookup (EIP-3668) gateways for L2 names, seen in the capture  |

The ENS gateways are chosen by ENS's contracts at lookup time, not by this
code, so other gateway hosts can appear for other addresses.

**Requested by the server only** (Netlify functions, never the browser):
Supabase (same project), the Upstash Redis host (`*.upstash.io`),
`forno.celo.org`, `spoo.me` (invite-link shortening, web build only) and
`auth.privy.io` (Privy JWKS for web-site sessions).

**Links the user can open** (navigation only, no data exchanged):

- MiniPay and Celo: `link.minipay.xyz` (Add Cash), `celoscan.io`
  (transactions), `www.opera.com` (Get MiniPay, on the screen shown when a
  Celo link is opened outside MiniPay)
- Support: `discord.gg`. Terms and Privacy are in-app routes.
- Bread: `bread.coop`, `app.breadchain.xyz`, `docs.bread.coop`,
  `fund.bread.coop`, `www.sourdough.systems`
- Footer: `discord.com`, `x.com`, `bsky.app`, `farcaster.xyz`,
  `www.linkedin.com`, `www.youtube.com`, `paragraph.com`, `github.com`,
  `opencollective.com`, `giveth.io`, `dune.com`
- Forms: `forms.gle`, `docs.google.com`, `form.typeform.com`
- Calendar reminders: `calendar.google.com`, `calendar.yahoo.com`,
  `outlook.cloud.microsoft`
- The other Stacks sites, where `?chain=` links for chains the mini site
  doesn't serve redirect: `stacks.bread.coop`, `nimiq.stacks.bread.coop`,
  `development.stacks.bread.coop`, `mini-development.stacks.bread.coop`

**In the code but not used on the mini site:** `*.privy.io` and WalletConnect
relays (Privy's code is downloaded in MiniPay but makes no requests), `docs.li.fi`
and LiFi endpoints, `nimpay.app` (Nimiq Pay), the explorers for other chains
(`gnosisscan.io`, `polygonscan.com`, `sepolia.etherscan.io`), and Celo Sepolia
(`forno.celo-sepolia.celo-testnet.org`, `celo-sepolia.blockscout.com`, used by
mini-development). Not hosts at all: `www.w3.org` (SVG namespace),
`stacks.invalid` (URL-parsing placeholder), `docs.privy.io` (a code comment).

> To regenerate: grep `src/` and `node_modules/@breadcoop/ui/dist` for
> `https?://` origins for the links, then load the site as MiniPay and record
> the hosts it requests — the ENS gateways only show up at runtime.

## Submission checklist

Form: <https://developer.minipay.to/mini-app-listing>

- [x] Zero-click connect, no signature prompts in the MiniPay path
- [x] Celo mainnet support
- [x] HTTPS
- [x] 512×512 icon (`public/web-app-manifest-512x512.png`)
- [x] Dependency security — exact versions pinned, `minimumReleaseAge`,
      `strictDepBuilds` + `allowBuilds` allowlist, committed lockfile,
      `--frozen-lockfile` installs (see note below)
- [x] Mobile viewport declared (`src/utils/metadata.ts` `viewport` export,
      `width=device-width, initial-scale=1`; pinch-zoom left enabled)
- [ ] **Terms of Service URL** — wired, URL needed
- [ ] **Privacy Policy URL** — wired, URL needed
- [x] **Support URL** — the Discord support channel (`LINKS.support`); the
      24h critical-fix SLA still applies
      <br>All three render from `LINKS` via `src/components/legal-links.tsx`,
      which shows only the entries that have a value — set them in
      `src/constants/links.ts` and they appear under the footer on every page.
- [ ] App name, tagline, publisher, category, production App URL: the mini site,
      `https://mini.stacks.bread.coop`, not `stacks.bread.coop`. A bare URL is fine
      there: the mini site configures only Celo, so it lands on Celo even if MiniPay's
      user agent stops matching `isMiniPayUserAgent` (`src/utils/minipay.ts`).
- [ ] Contracts verified on Celoscan + one sample transaction link per
      user-facing method (deployment now lives in the `saving-circles` repo —
      record the deployed addresses here)
- [ ] PageSpeed Insights score for the production URL (mobile)
- [ ] Responsive check at 360×640

### Note on dependency pinning

MiniPay's checklist asks for exact versions in `package.json`, and they are
pinned — along with a committed `pnpm-lock.yaml` and `--frozen-lockfile`
installs, which also pin every transitive package.

An earlier attempt was reverted because changing the specifiers forced a full
lockfile re-resolution, which trips `trustPolicy: no-downgrade` on several
transitive packages (`undici-types`, `ua-parser-js`, `slow-redact`,
`@noble/hashes`, …); satisfying the checklist that way would have meant
widening `trustPolicyExclude`, including on a crypto library.

That is no longer necessary. The lockfile records the specifier it resolved
each package from, so pinning the manifest alone leaves the two disagreeing and
pnpm re-resolves to reconcile them. Rewriting those `specifier:` fields to the
pinned versions keeps them in agreement, and pnpm then reports "Lockfile is up
to date, resolution step is skipped" — no re-resolution, no trust-policy
change, and the resolved versions are byte-identical.

The trust wall is still there for anything that _does_ re-resolve (`pnpm add`,
`pnpm update`), exactly as before this change. Bump the offending direct
dependency rather than widening the exclude list.

Likewise `ignore-scripts=true` is **not** set: pnpm 11's `strictDepBuilds` +
`allowBuilds` already blocks dependency build scripts by default with an
explicit allowlist, and a blanket flag would break the five packages that
legitimately need to build.

Note that `minimumReleaseAge` is in **minutes** (pnpm: `1440` is one day). It
previously read `864000` with a `# 10 days` comment, which was 600 days and
would have blocked every recent release had anything re-resolved; it is now
`14400`, above MiniPay's 7-day (`10080`) floor.
