# On-chain journey tests

A **test-only** harness that drives the **real** Stacks UI end to end for the
three new stack types — **ASCA** (savings & credit fund), **Goal savings** and
**Collective fund** — signing every transaction with a local key **instead of a
Privy login**, against a local anvil fork of Gnosis.

Every step is performed by clicking the app's own buttons and filling its own
forms, and every step is then asserted by an **independent** viem read against
`http://localhost:8545`. A green run means the app's wiring produced the
on-chain effect — not that the test script did.

## What each journey proves

`journey-asca.cjs` — savings & credit fund

1. **create** via `/new` (type picker → ASCA form) → `FundCreated` +
   `getFund` (token, borrow limit, interest rate, periods, period length)
2. **invite** from the success modal, **join** with a second wallet →
   `isMember`, `usedNonces`, roster length
3. **deposit** from both wallets → `savings`, `totalSavings`, `poolCash`,
   `creditLineOf`, and the exact ERC-20 spend
4. **borrow** → loan principal, `Borrowed.dueDate == borrow time + N periods`,
   tokens actually moved, `poolCash` debited
5. **repay** after a time warp → principal 0, `Repaid.interestPaid > 0`,
   `accInterestPerShare` grew, interest split across both savers
6. **claim interest** → the wallet receives exactly `pendingInterestOf`
7. **withdraw** → `savings` back to 0, tokens returned

`journey-goal.cjs` — goal savings

1. **create** with a beneficiary → `GoalCreated` + `getGoal` (target,
   deadline picked in the form, beneficiary)
2. **invite + join** with a second wallet
3. **deposits** from both wallets → `contributions`, `totalDeposited`,
   `goalReached` still false below the target
4. **crossing the target** → `goalReached` latch + `GoalReached` event,
   `goalState == Funded`
5. **release** → the beneficiary receives the whole pot (overshoot included),
   `goalState == Released`, the goal is emptied
6. a second goal in **reclaim mode** (no beneficiary) → deposit, then
   **withdraw** refunds the contribution exactly

`journey-collective.cjs` — collective fund

1. **create** with an on-chain name and an approval threshold → `FundCreated`
   and `getFund` (name, voting period, `approvalThresholdBps`)
2. **invite + join** → `isMember`, `memberIndex`, roster
3. **deposits** → `sharesOf` (1:1), `totalShares`, `poolBalance`
4. **propose** a disbursement → snapshotted `electorate` and `requiredYes`
   (ceil of the threshold), proposer auto-vote, `proposalState == Active`
5. **vote** from the second member → `yesVotes == 2`, `proposalState == Passed`
6. **execute** → recipient paid exactly, `poolBalance` debited, `Executed`
7. **rage-quit withdraw** → payout equals
   `floor(shares * poolBalance / totalShares)` **exactly** (the amounts are
   chosen so the division has a remainder)

The assertion reads use the app's **own** ABIs from `src/lib/abis/*.ts`
(loaded straight out of the TS source), so an ABI that drifts from the
deployed contract fails the test instead of silently passing.

## How it works (and why no key reaches the app)

The app ships no test hooks. The harness injects an
[EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) `window.ethereum` shim via
Playwright `addInitScript`, announced over
[EIP-6963](https://eips.ethereum.org/EIPS/eip-6963), and preseeds wagmi's store
so the app auto-reconnects with no modal. The shim is a pure **proxy**: reads go
to the fork RPC, signing is delegated to Node (`window.__stacksWallet` → viem
`privateKeyToAccount`). **The private keys live only in this Node process** —
never in the page, the Next build graph, a `NEXT_PUBLIC_*` var, or `.next/`.
`run.sh` ends with `check-bundle.sh`, a grep gate that fails if a key ever
shows up in the built app.

Each journey runs **two** browser sessions — one per wallet — so the invite /
join / vote steps are genuinely performed by a second, independent wallet.

### The one thing the app needs

Privy's embedded wallet cannot be driven from localhost (Turnstile CAPTCHA plus
a domain allowlist), so the app has a triple-gated local mode
(`src/lib/e2e.ts`): with `NEXT_PUBLIC_NODE_ENV=local`,
`NEXT_PUBLIC_E2E_WALLET=true` and `NEXT_PUBLIC_CHAIN_ID=31337` it derives the
connected user from wagmi and signs through the injected wallet. The gate can
never be true in a deployed environment.

## Run it

```bash
cd e2e/onchain-journey
npm install                        # playwright + viem, isolated from the app
npx playwright install chromium    # once, if Playwright has no browser cached
npm test                           # = bash run.sh
```

`run.sh` reuses an anvil on `:8545` and a dev server on `:3001` if they are
already up (and starts them if not), checks the four contract addresses in
`.env.local` have code, funds both test wallets with gas and BREAD, runs the
three journeys, and exits non-zero on any failed assertion. It only stops what
it started.

Requirements: `anvil`/`foundry`, node 18+, and the contracts deployed locally
(`make deploy` from the repo root). Override anything via `.env`
(see `.env.example`).

The harness never resets chain state: every journey reads `nextId` and asserts
against the id it creates, so runs are repeatable against a dirty chain.

## Videos

Each session records a 1280×800 video into `artifacts/`:

```
artifacts/asca-owner.webm        artifacts/asca-member.webm
artifacts/goal-owner.webm        artifacts/goal-member.webm
artifacts/collective-owner.webm  artifacts/collective-member.webm
```

The UI is driven at a deliberately watchable pace so these can be turned into
docs GIFs; raise `TEST_PACE` to slow it down further.

## Extending

Add a step to a journey: drive the page with the helpers in `ui.cjs`, then
assert the effect with a read in `lib.cjs` (`R.*`) or an event via
`findEvent`. A step that cannot be asserted on chain does not count.

> The signers are anvil dev accounts #0/#1/#2 — publicly known keys, funded
> only on the local fork. They are intentionally not secrets.
