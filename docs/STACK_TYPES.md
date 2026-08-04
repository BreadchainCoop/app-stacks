# Stack types

A **stack** is a group of people saving together. App-Stacks supports four kinds,
each backed by its **own contract** with its **own id space**, its own creation
form and its own detail route. The discriminator lives in
[`src/lib/stack-types.ts`](../src/lib/stack-types.ts) (`"rosca" | "asca" | "goal" | "collective"`)
and is the thing to reach for whenever code has to branch on kind.

For how the app is put together, see [ARCHITECTURE.md](./ARCHITECTURE.md); for the
off-chain metadata model, see [SUPABASE.md](./SUPABASE.md).

## At a glance

| Type         | Label in the UI       | Create at         | Detail route   | Contract                    | Env var                                        | Feature flag     |
| ------------ | --------------------- | ----------------- | -------------- | --------------------------- | ---------------------------------------------- | ---------------- |
| `rosca`      | Saving stack          | `/new`            | `/stacks/[id]` | `SavingCircles`             | `NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS`  | — (always on)    |
| `asca`       | Savings & credit fund | `/new/asca`       | `/ascas/[id]`  | `AccumulatingSavingCircles` | `NEXT_PUBLIC_ASCA_CONTRACT_ADDRESS`            | `asca`           |
| `goal`       | Goal savings          | `/new/goal`       | `/goals/[id]`  | `GoalSavingCircles`         | `NEXT_PUBLIC_GOAL_SAVINGS_CONTRACT_ADDRESS`    | `goalSavings`    |
| `collective` | Collective fund       | `/new/collective` | `/funds/[id]`  | `CollectiveFundCircles`     | `NEXT_PUBLIC_COLLECTIVE_FUND_CONTRACT_ADDRESS` | `collectiveFund` |

Common to all four:

- **One token per stack** — currently BREAD (`NEXT_PUBLIC_BREAD_TOKEN_ADDRESS`),
  which must be allowlisted on the contract. Every amount is 18-decimal wei.
- **Invite links, not address lists.** The owner signs an EIP-712 invite off-chain;
  the joiner redeems it with `redeemInvite`. Nonces are single-use
  (`usedNonces`), and `/stacks/join?type=…` picks the right contract.
- **Sponsored transactions.** Writes go through `useSponsoredTx`, so a member
  never needs gas.
- **Off-chain metadata** (display name, invite links) lives in Supabase under a
  type-prefixed id — `asca:3`, `goal:3`, `collective:3`; bare `3` stays ROSCA. See
  `stackMetadataId` / `parseStackMetadataId`.
- The three new types are **feature-gated** (`src/lib/features.ts`). They render
  unconditionally when `NEXT_PUBLIC_NODE_ENV=local`; on a deployed environment
  they need an entry in `NEXT_PUBLIC_FEATURES`, optionally restricted to a list
  of wallet addresses.

The GIFs below are real recordings of the on-chain journey tests
([`e2e/onchain-journey`](../e2e/onchain-journey/README.md)) driving the actual UI
against an anvil fork of Gnosis — every number on screen came back from the
chain. Dead time (waiting on a transaction, or on the other wallet) is cut out.

---

## 1. Saving stack (ROSCA)

**Rotating** savings: everyone deposits the same fixed amount each round, and one
member claims the whole pot each round, until everyone has been paid once.

- **Create:** `/new` → "Saving stack" → the multi-step wizard.
  `create({ owner, depositAmount, token, depositInterval, … })`
- **Detail:** `/stacks/[id]` — round status, claim schedule, members, deposits.
- **Flow:** create → invite → members join → each round: `deposit`, then the
  member whose turn it is calls `withdraw` (claims the pot) → repeat →
  `decommission` when the group is done.
- **Automatic claim:** an opt-in per-member toggle on the detail page
  (`AutomaticSavingCircles` + Chainlink Automation, feature `automaticClaim`)
  that claims the pot for you when your turn comes, so nobody has to be online.

This is the original product; it is the only type that is not feature-gated.

---

## 2. Savings & credit fund (ASCA)

> Save flexible amounts together, earn interest, and borrow against your own savings.

An **accumulating** fund: there are no rounds and no fixed deposit. Members save
whatever they want, whenever they want, and each member gets a **credit line
that is a fraction of their own savings** — so a loan is always over-collateralized
by the borrower's own deposit and no one else's money is at risk. Interest paid on
loans is shared pro-rata across all savers.

**Contract:** `AccumulatingSavingCircles` · **Create:** `/new/asca` · **Detail:** `/ascas/[id]`

**Created with** `create(token, borrowLimitBps, interestRateBps, repaymentPeriods, periodLength)`.
The form takes percentages and converts to basis points (`percentToBps`), so
"2.5%" is `250` on chain.

| Form field             | Meaning                                                      |
| ---------------------- | ------------------------------------------------------------ |
| Fund name              | Off-chain (Supabase) display name                            |
| Max. amount of members | How many invite links to mint                                |
| Borrow limit           | % of your own savings you may borrow (e.g. 50%)              |
| Interest rate          | % per period, charged on the principal                       |
| Period length          | How long a repayment period is (also sets the loan due date) |

**User flow**

1. **Create** — owner picks the credit terms and gets a success modal with one
   invite link per seat.
2. **Join** — invitees open the link and `redeemInvite`.
3. **Deposit** — any amount, any time. Your `savings` grows, so does the pool's
   `poolCash` and your `creditLineOf`.
4. **Borrow** — up to `borrowLimit × your savings`, paid out of pool cash. The
   loan is due after `repaymentPeriods × periodLength`.
5. **Repay** — the payment settles accrued interest first, then principal. The
   interest is added to `accInterestPerShare` and split across every saver.
6. **Claim interest** — each saver withdraws their `pendingInterestOf` share.
7. **Withdraw** — take your savings back out (up to what your open loan allows).
   Overdue loans can be `liquidate`d against the borrower's own savings, and the
   owner can `deactivate` the fund.

![ASCA journey: create a savings & credit fund, invite, deposit, borrow, repay, claim interest, withdraw](./media/asca-journey.gif)

---

## 3. Goal savings

> Save together toward a target by a deadline — release to a beneficiary or reclaim your share.

A group saves toward one **target amount** by a **deadline**. Two modes, chosen at
creation by whether you name a beneficiary:

- **Beneficiary mode** — when the target is hit, the whole pot (overshoot
  included) is released to the named address. Good for "let's buy X for Y".
- **Reclaim mode** (no beneficiary) — contributions are refundable; each member
  withdraws their own share.

**Contract:** `GoalSavingCircles` · **Create:** `/new/goal` · **Detail:** `/goals/[id]`

**Created with** `create(token, goalAmount, deadline, beneficiary)`, where an empty
beneficiary field is sent as the zero address (reclaim mode).

**User flow**

1. **Create** — set the target, the deadline, the member count, and optionally a
   beneficiary.
2. **Join** — invitees redeem their invite link.
3. **Deposit** — contributions accumulate in `contributions` / `totalDeposited`.
   The page shows progress toward the target and time left.
4. **Target reached** — `goalReached` latches true and the goal state becomes
   `Funded`.
5. **Release** — the pot goes to the beneficiary in one transaction; the goal
   becomes `Released`.
   In reclaim mode there is no beneficiary and members simply **withdraw** their
   own contribution instead.
6. If the deadline passes without hitting the target, contributions are
   refundable; the owner can also `cancel` a goal.

![Goal savings journey: create a goal with a beneficiary, deposit, cross the target, release the pot, then a reclaim-mode goal and a refund](./media/goal-journey.gif)

---

## 4. Collective fund

> Pool money as a community, propose and vote on how to spend it, and leave anytime.

A community treasury. Deposits mint **shares 1:1**, spending is decided by a
**vote**, and a member can leave at any time and take their pro-rata slice of
whatever is left ("rage quit"). Anyone — member or not — can `donate` to the pool
without receiving shares.

**Contract:** `CollectiveFundCircles` · **Create:** `/new/collective` · **Detail:** `/funds/[id]`

**Created with** `create(token, organiser, name, votingPeriod, approvalThresholdBps)`.
Unlike the other types the fund **name is on chain**, because the fund is meant to
be publicly identifiable.

**User flow**

1. **Create** — name the fund, pick a voting period and an approval threshold
   (% of members that must vote yes).
2. **Join** — invitees redeem their invite link and become voters.
3. **Deposit** — mints shares 1:1 and grows `poolBalance`.
4. **Propose** — a member proposes a disbursement (recipient + amount). The
   proposal snapshots the current electorate and the required yes-count
   (`ceil(members × threshold)`); the proposer's own yes vote is counted
   automatically.
5. **Vote** — other members vote during the voting period. Once the required
   yes-count is reached the proposal is `Passed`.
6. **Execute** — anyone can execute a passed proposal; the recipient is paid from
   the pool.
7. **Withdraw (rage quit)** — burn your shares for
   `floor(shares × poolBalance / totalShares)` and leave. Approved spending
   dilutes everyone pro-rata, which is why leaving is always allowed.

![Collective fund journey: create a fund, deposit for shares, propose a disbursement, vote, execute, rage-quit withdraw](./media/collective-journey.gif)

---

## Adding a fifth type

The seams to touch, in order:

1. `src/lib/stack-types.ts` — add the discriminator, label, description, detail
   base path.
2. `src/lib/features.ts` — add the feature key so it can be dark-launched.
3. `src/lib/abis/` + `src/lib/env.ts` — ABI and contract address.
4. `src/app/new/<type>/` — form + overview (create), and a card in
   `src/app/new/_components/onboarding/type-picker.tsx`.
5. `src/app/<plural>/[id]/` — detail page.
6. `src/app/stacks/join/_components/<type>-invite.tsx` — the join branch.
7. `src/hooks/use-<type>-*.ts` — reads and a `use-<type>-tx.ts` write wrapper.
8. `e2e/onchain-journey/journey-<type>.cjs` — a journey that proves it works,
   and a GIF here.
