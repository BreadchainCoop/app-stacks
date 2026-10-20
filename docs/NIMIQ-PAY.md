# Nimiq Pay mini app

How Stacks runs inside [Nimiq Pay](https://nimiq.dev/mini-apps)'s in-app WebView. For the
provider stacks in general see [ARCHITECTURE.md](./ARCHITECTURE.md); MiniPay, the other
wallet host, is in [MINIPAY.md](./MINIPAY.md).

## What runs where

Nimiq Pay loads the **web site** — the one serving the Privy chain — not the mini site:
`stacks.bread.coop` (Gnosis) in prod, `development.stacks.bread.coop` (Sepolia) in dev.
It uses the same contracts and Supabase project as everyone else, so a Nimiq Pay user and
a web user can share a stack.

Nimiq's own chain can't hold a stack: it has only basic, vesting, HTLC and staking
accounts, with no user-deployed contracts. So the app talks to the **EVM wallet** Nimiq
Pay injects at `window.ethereum` (EIP-1193, EIP-6963) and needs neither `@nimiq/core`
nor `@nimiq/mini-app-sdk`. The SDK is only for the NIM provider (NIM payments, NIM
signing, NIM balances), which nothing uses yet.

|         | Web (Privy)                | Nimiq Pay                                                     |
| ------- | -------------------------- | ------------------------------------------------------------- |
| Wallet  | Privy embedded / external  | Nimiq Pay's injected EVM wallet                               |
| Connect | Privy login                | ui-kit `LoginButton` → RainbowKit modal                       |
| Auth    | Privy access token         | `/api/nimiq-pay/session` HMAC JWT, after an EIP-712 signature |
| Gas     | Privy sponsorship (Gnosis) | Paid by the user in the chain's native token                  |
| Invites | Join link                  | Join link                                                     |

## How it mounts

`window.nimiqPay` (injected before page scripts run) marks the WebView
(`isNimiqPayBrowser()`, `src/utils/nimiq-pay.ts`). On a non-Celo chain,
`src/components/providers/index.tsx` then mounts `NimiqPayProviders`
(`src/components/providers/nimiq-pay.tsx`) and publishes `useWalletHost() === "nimiqpay"`.
A Celo link opened in Nimiq Pay hits `ChainBrowserGuard` ("Open this in MiniPay").

There is no server-side hint yet — whether Nimiq Pay's user agent identifies it is
unverified — so the server render and first client render take the Privy branch and the
stack switches right after hydration. If the user agent turns out to carry a marker, add
an `isServerNimiqPay()` beside `src/lib/server-minipay.ts`, as MiniPay does.

## Connecting and signing in

Nimiq Pay opens a native dialog for every account request and signature, and its mini
app guidelines ask that each follow a deliberate tap and that none open on page load. So:

1. **Connect** — the ui-kit `LoginButton` opens RainbowKit's connect modal, which lists
   the injected wallet (`connectorsForWallets` with `injectedWallet`; a bare wagmi
   `injected()` leaves that modal empty). wagmi's silent reconnect (`eth_accounts`)
   restores the connection on later opens.
2. **Sign in** — once connected without a session, the "Sign in to Stacks" modal
   (`src/components/modal/modals/nimiq-pay-sign-in.tsx`) asks once per page load. Its
   button fetches a nonce (`/api/nimiq-pay/nonce`, single-use, 5 minutes in Upstash
   Redis), has the wallet sign `nimiqPaySignInTypedData` (`src/lib/nimiq-pay-sign-in.ts`,
   EIP-712, as Nimiq's checklist asks of login challenges), and posts it to
   `/api/nimiq-pay/session`. The server consumes the nonce, checks the signature, onboards
   `nimiqpay:<address>` (`src/app/api/onboard-external-user.ts`, shared with MiniPay) and
   mints a 7-day token (`src/app/api/session-token.ts`). The token is kept in
   `localStorage`, so a returning user isn't asked again until it expires.
3. **"Not now"** leaves the user connected but signed out: contract reads and writes
   work, authenticated API routes (join requests, profile) don't, until the app is
   reopened.

Unlike MiniPay's session, which trusts the injected address, this one requires proof of
key possession — Nimiq Pay can sign, so it must.

## Transactions and gas

`NimiqPayTxSenderProvider` switches the wallet to the active chain first (Nimiq Pay opens
on Ethereum; for a chain it doesn't list, such as Gnosis, the injected connector adds it),
then sends. There is **no gas sponsorship** outside Privy: the user needs xDAI on Gnosis,
or Sepolia ETH in dev. The fund modal shows the LI.FI bridge but not the Privy-only
"fund from your connected wallet" section.

On Sepolia, `SepoliaAutoFund` tops the connected address up with Sepolia ETH and test
BREAD, so the dev site can be tested end to end.

## Open questions

- **Can Nimiq Pay reach Gnosis?** It isn't on Nimiq Pay's chain list (Ethereum,
  Polygon, Arbitrum One, Optimism, Base, BNB Smart Chain, Sepolia); `wallet_addEthereumChain`
  is documented but unconfirmed for chain `100`. Prod depends on this. If it fails, prod
  needs another chain (e.g. Polygon): a contract deployment and a site of its own.
- **Funding.** Nimiq Pay users hold NIM and USDT on Polygon; a Gnosis stack needs BREAD
  to deposit and xDAI for gas. Needs a product decision before listing.

## Testing

Physical device, Nimiq Pay installed.

- **A PR's deploy preview** (its env has Sepolia): Nimiq Pay → Mini Apps → Custom URL →
  `https://deploy-preview-<N>--app-stacks.netlify.app/?chain=sepolia`.
- **Locally**: `pnpm dev`, exposed over HTTPS (ngrok or similar), into the same Custom URL
  field. Plain `http://<LAN IP>` works too, but secure-context APIs may be missing.
- Nimiq Pay's testnet switch (app menu → long-press settings for 10 seconds) changes NIM
  only; EVM chains stay as they are.

## Environment

`NIMIQ_PAY_SESSION_SECRET` (any long random string, distinct from MiniPay's) on every
deployment Nimiq Pay loads: the web sites' production and `development` contexts and
Deploy Previews. The mini sites need nothing new.

## Listing

Share or list the web site's URL. Deeplinks that open it inside Nimiq Pay:
`nimiqpay://miniapp?url=stacks.bread.coop` or
`https://nimpay.app/miniapps/open/stacks.bread.coop`.
