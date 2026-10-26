# Nimiq Pay mini app

How Stacks runs inside [Nimiq Pay](https://nimiq.dev/mini-apps)'s in-app WebView. For the
provider stacks in general see [ARCHITECTURE.md](./ARCHITECTURE.md); MiniPay, the other
wallet host, is in [MINIPAY.md](./MINIPAY.md).

## What runs where

In prod Nimiq Pay loads the **nimiq site**, `nimiq.stacks.bread.coop`. It configures only
Polygon, and its deposit token is Polygon's USDT, which Nimiq Pay users already hold. In
dev it loads the web site, `development.stacks.bread.coop` (Sepolia), because Nimiq Pay
lists no Polygon testnet. The nimiq site builds the `nimiq` branch, which
`.github/workflows/sync-mini-branches.yml` mirrors from `main`, against the same Supabase
project as the other sites.

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
| Chain   | Gnosis / Sepolia           | Polygon (prod), Sepolia (dev)                                 |
| Token   | BREAD (18 dec)             | USDT (6 dec) on Polygon, test BREAD on Sepolia                |
| Gas     | Privy sponsorship (Gnosis) | Paid by the user in the chain's native token (POL on Polygon) |
| Invites | Join link                  | Join link                                                     |

## How it mounts

`window.nimiqPay` (injected before page scripts run) marks the WebView
(`isNimiqPayBrowser()`, `src/utils/nimiq-pay.ts`). On a non-Celo chain,
`src/components/providers/index.tsx` then mounts `NimiqPayProviders`
(`src/components/providers/nimiq-pay.tsx`) and publishes `useWalletHost() === "nimiqpay"`.
A Celo link opened in Nimiq Pay hits `ChainBrowserGuard` ("Open this in MiniPay").

Polygon is Nimiq Pay-only (`isNimiqPayChain()`), as Celo is MiniPay-only. A Polygon link
opened anywhere else hits `ChainBrowserGuard` ("Open this in Nimiq Pay"), whose button
reopens the same URL through the `nimpay.app` deeplink. A URL that names no chain sends
Nimiq Pay to Polygon when the site configures it. Until the `window.nimiqPay` check has
run, a Polygon page renders nothing, so Nimiq Pay doesn't flash the guard.

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
then sends. There is **no gas sponsorship** outside Privy: the user needs POL on Polygon,
xDAI on Gnosis, or Sepolia ETH in dev. On Polygon the fund modal asks for USDT and
mentions the POL; on the BREAD chains it shows the LI.FI bridge. Neither shows the
Privy-only "fund from your connected wallet" section.

Each transaction opens a native dialog, so a first deposit takes two taps: "Allow USDT"
(the approve), then "Pay Deposit" (`src/components/deposit-button.tsx`). A first goal
deposit is the same, "Allow USDT" then "Deposit"
(`src/app/goals/[id]/_components/use-goal-action.ts`), and turning on automatic deposits
is "Grant Permission and Activate" then "Activate"
(`src/components/automatic-deposits/use-automatic-deposits.ts`). Elsewhere the approve and
the action share one tap.

On Sepolia, `SepoliaAutoFund` tops the connected address up with Sepolia ETH and test
BREAD, so the dev site can be tested end to end.

## Paying

On the nimiq site, Nimiq Pay users pay into stacks in USDT on Polygon, from Nimiq Pay's
EVM wallet. On the dev site they pay in test BREAD on Sepolia, as web users do.

NIM can't be a stack's token. A stack is a `SavingCircles` contract holding one
allow-listed ERC-20 (`setTokenAllowed`), and NIM is neither on an EVM chain nor an
ERC-20 — Nimiq's own chain has no contracts to hold it. The routes considered, and
deferred, for taking NIM anyway, and the one taken instead:

- **Relay** — the user sends NIM to a Stacks address; the server prices it and pays the
  BREAD in with `depositFor`. No new contract, but Stacks would hold and exchange users'
  NIM, and needs a price feed, a funded hot wallet and refunds.
- **NIM-only stacks** — members pay each round's recipient directly in NIM and the app
  records the payments. No contract can hold the money, so nothing enforces payment.
- **USDT on Polygon** (taken) — not NIM, but what Nimiq Pay users hold: a
  `SavingCircles` deployment on Polygon with USDT allowed, and a site of its own.

## Open questions

- **Can Nimiq Pay reach Gnosis?** It isn't on Nimiq Pay's chain list (Ethereum,
  Polygon, Arbitrum One, Optimism, Base, BNB Smart Chain, Sepolia); `wallet_addEthereumChain`
  is documented but unconfirmed for chain `100`. Prod no longer depends on this, since it
  runs on Polygon. It matters only for a web-site (Gnosis) link opened in Nimiq Pay.
- **Do Nimiq Pay deeplinks keep the path?** Invite links shared from Nimiq Pay are
  wrapped as `https://nimpay.app/miniapps/open/<host><path>?<query>`
  (`nimiqPayOpenLink()`). Nobody has confirmed on a device that Nimiq Pay keeps the path
  and query rather than opening the site root.

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
deployment Nimiq Pay loads: the nimiq site, plus the web sites' production and
`development` contexts and Deploy Previews. The mini sites need nothing new.

The nimiq site (`nimiq` branch context) sets `NEXT_PUBLIC_CHAIN_ID=137` and a
`NEXT_PUBLIC_CHAINS` holding only chain `137`, with its `SavingCircles` deployment and
`"depositToken": {"address": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", "symbol": "USDT", "decimals": 6}`.
The rest of its env matches the web site's.

## Listing

Share or list the nimiq site's URL. Deeplinks that open it inside Nimiq Pay:
`nimiqpay://miniapp?url=nimiq.stacks.bread.coop` or
`https://nimpay.app/miniapps/open/nimiq.stacks.bread.coop`. Invite links created inside
Nimiq Pay already use the second form.
