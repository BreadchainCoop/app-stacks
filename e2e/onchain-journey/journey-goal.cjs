/* Goal savings — full member lifecycle through the REAL UI, asserted on chain.
 *
 *   goal A (beneficiary mode)
 *     create (via /new type picker)   -> GoalCreated + getGoal config
 *     invite + join (second wallet)   -> isMember + usedNonces + roster
 *     deposits from both wallets      -> contributions / totalDeposited
 *     crossing the target             -> goalReached latch + GoalReached event
 *     release                         -> beneficiary paid in full, state Released
 *
 *   goal B (reclaim mode, no beneficiary)
 *     create + deposit past the target -> Funded but not releasable
 *     withdraw                         -> contribution refunded, back to 0
 */
const { formatEther, zeroAddress } = require("viem");
const L = require("./lib.cjs");
const U = require("./ui.cjs");

const { R, A, ONE, OUTSIDER, ok, head, waitFor, finish, same, findEvent } = L;

/** Mirrors src/lib/goal-state.ts / IGoalSavingCircles.GoalState. */
const GoalState = {
  Funding: 0,
  Funded: 1,
  Failed: 2,
  Cancelled: 3,
  Released: 4,
};

const GOAL_AMOUNT = 30n * ONE;
const OWNER_DEPOSIT = 20n * ONE;
const MEMBER_DEPOSIT = 15n * ONE;
const RECLAIM_AMOUNT = 8n * ONE;

/** A datetime-local value `hours` ahead of BLOCK time, plus its unix seconds. */
async function futureDeadline(days = 1) {
  // The deadline field is a plain date input; the goal closes at local midnight
  // at the start of the chosen day, which is what the app puts on chain.
  const chainNow = await L.fork.blockTimestamp();
  const date = new Date(Number(chainNow) * 1000);
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  const value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
  return { value, seconds: BigInt(Math.floor(date.getTime() / 1000)) };
}

/** Drive /new -> the goal form -> Create Goal, and return the new goal id. */
async function createGoal(
  page,
  { name, members, amount, deadline, beneficiary }
) {
  const idBefore = await R.goal.nextId();
  await U.goto(page, "/new");
  await U.clickLink(page, "Goal savings", 2500);
  await U.waitForUrl(page, "/new/goal");
  await U.fillField(page, "name", name);
  await U.fillField(page, "members", members);
  await U.fillField(page, "goalAmount", formatEther(amount));
  await U.fillField(page, "deadline", deadline.value);
  if (beneficiary) {
    await page.locator('input[value="beneficiary"]').first().check();
    await U.beat(400);
    await U.fillField(page, "beneficiary", beneficiary);
  } else {
    await page.locator('input[value="reclaim"]').first().check();
    await U.beat(400);
  }
  await U.beat(900);
  await U.click(page, "Create Goal", 1500);
  const text = await U.waitForText(
    page,
    /Goal savings created|Goal Creation Failed/i
  );
  return { id: idBefore, created: /Goal savings created/i.test(text) };
}

(async () => {
  const ownerSession = await U.openSession("goal-owner", L.owner);
  const memberSession = await U.openSession("goal-member", L.member);
  const ownerAddr = L.owner.account.address;
  const memberAddr = L.member.account.address;
  const op = ownerSession.page;
  const mp = memberSession.page;

  const fromBlock = await L.pub.getBlockNumber();

  /* ------------------------------------------------------------------ 1 -- */
  head("1) create a goal with a beneficiary through the real /new flow");
  const deadline = await futureDeadline(1);
  const { id: goalId, created } = await createGoal(op, {
    name: `E2E Goal ${Date.now() % 100000}`,
    members: 2,
    amount: GOAL_AMOUNT,
    deadline,
    beneficiary: OUTSIDER,
  });
  ok(created, "the creation success modal appeared");
  ok(
    (await R.goal.nextId()) === goalId + 1n,
    `nextId advanced to ${goalId + 1n}`
  );

  const goal = await R.goal.getGoal(goalId);
  ok(same(goal.owner, ownerAddr), "getGoal.owner is the creating wallet");
  ok(same(goal.token, A.bread), "getGoal.token is BREAD");
  ok(
    same(goal.beneficiary, OUTSIDER),
    "getGoal.beneficiary is the address typed in the form"
  );
  ok(
    goal.goalAmount === GOAL_AMOUNT,
    `getGoal.goalAmount == ${formatEther(GOAL_AMOUNT)} BREAD`
  );
  ok(
    goal.deadline === deadline.seconds,
    `getGoal.deadline == the deadline picked in the form (${goal.deadline})`
  );
  ok(
    (await R.goal.state(goalId)) === GoalState.Funding,
    "goalState == Funding"
  );
  const createdEvent = await findEvent({
    address: A.goal,
    abi: L.abis.goal,
    eventName: "GoalCreated",
    fromBlock,
    match: (args) => args.id === goalId,
  });
  ok(
    !!createdEvent &&
      same(createdEvent.args.owner, ownerAddr) &&
      createdEvent.args.goalAmount === GOAL_AMOUNT,
    "GoalCreated was emitted with the configured target"
  );

  /* ------------------------------------------------------------------ 2 -- */
  head("2) invite a second wallet from the success modal and redeem it");
  const links = await waitFor(
    () => U.readInviteLinks(op),
    (l) => l.length >= 1,
    120000
  );
  ok(links.length === 1, "the modal rendered 1 signed invite link");
  const inviteUrl = new URL(links[0]);
  ok(inviteUrl.searchParams.get("type") === "goal", "invite carries type=goal");
  ok(
    inviteUrl.searchParams.get("circleId") === goalId.toString(),
    `invite carries circleId=${goalId}`
  );
  const nonce = BigInt(inviteUrl.searchParams.get("nonce"));
  ok(
    (await R.goal.usedNonce(goalId, nonce)) === false,
    "the invite nonce is unused before redemption"
  );

  await mp.goto(links[0], { waitUntil: "domcontentloaded" });
  await U.beat(3500);
  ok(
    (await mp.getByText("You are invited!").count()) > 0,
    "the second wallet sees the invite page"
  );
  await U.click(mp, "Accept invite", 2500);
  ok(
    (await waitFor(
      () => R.goal.isMember(goalId, memberAddr),
      (v) => v === true
    )) === true,
    "isMember(second wallet) is true on chain"
  );
  ok(
    (await R.goal.usedNonce(goalId, nonce)) === true,
    "the invite nonce is now spent"
  );
  ok((await R.goal.members(goalId)).length === 2, "roster now has 2 members");

  /* ------------------------------------------------------------------ 3 -- */
  head("3) the owner deposits, short of the target");
  await U.goto(op, `/goals/${goalId}`, 3500);
  let panel = U.section(op, "Your contribution");
  await U.fillPlaceholder(panel, "Amount", formatEther(OWNER_DEPOSIT));
  ok(
    await U.runTx(op, {
      scope: panel,
      open: "Deposit",
      confirm: "Deposit",
      success: "Deposit successful",
    }),
    "the deposit success modal appeared"
  );
  ok(
    (await waitFor(
      () => R.goal.contribution(goalId, ownerAddr),
      (v) => v === OWNER_DEPOSIT
    )) === OWNER_DEPOSIT,
    `contributions(owner) == ${formatEther(OWNER_DEPOSIT)} BREAD`
  );
  ok(
    (await R.goal.totalDeposited(goalId)) === OWNER_DEPOSIT,
    "totalDeposited tracks the single deposit"
  );
  ok(
    (await R.goal.reached(goalId)) === false,
    "goalReached is still false below the target"
  );
  ok(
    (await R.goal.state(goalId)) === GoalState.Funding,
    "goalState is still Funding"
  );

  /* ------------------------------------------------------------------ 4 -- */
  head("4) the second member deposits and crosses the target");
  const reachBlock = await L.pub.getBlockNumber();
  await U.goto(mp, `/goals/${goalId}`, 3500);
  panel = U.section(mp, "Your contribution");
  await U.fillPlaceholder(panel, "Amount", formatEther(MEMBER_DEPOSIT));
  ok(
    await U.runTx(mp, {
      scope: panel,
      open: "Deposit",
      confirm: "Deposit",
      success: "Deposit successful",
    }),
    "the deposit success modal appeared"
  );
  const pot = OWNER_DEPOSIT + MEMBER_DEPOSIT;
  ok(
    (await waitFor(
      () => R.goal.totalDeposited(goalId),
      (v) => v === pot
    )) === pot,
    `totalDeposited == ${formatEther(pot)} BREAD (overshoots the target)`
  );
  ok(
    (await R.goal.contribution(goalId, memberAddr)) === MEMBER_DEPOSIT,
    `contributions(second member) == ${formatEther(MEMBER_DEPOSIT)} BREAD`
  );
  ok((await R.goal.reached(goalId)) === true, "goalReached latched to true");
  ok((await R.goal.state(goalId)) === GoalState.Funded, "goalState == Funded");
  const reachedEvent = await findEvent({
    address: A.goal,
    abi: L.abis.goal,
    eventName: "GoalReached",
    fromBlock: reachBlock,
    match: (args) => args.id === goalId,
  });
  ok(
    !!reachedEvent && reachedEvent.args.totalDeposited === pot,
    "GoalReached was emitted once, with the crossing total"
  );

  /* ------------------------------------------------------------------ 5 -- */
  head("5) release the whole pot to the beneficiary");
  const beneficiaryBefore = await L.R.breadBalance(OUTSIDER);
  await U.goto(op, `/goals/${goalId}`, 3500);
  const releasePanel = U.section(op, "Release the pot");
  ok(
    await U.runTx(op, {
      scope: releasePanel,
      open: "Release to beneficiary",
      confirm: "Release",
      success: "Pot released",
    }),
    "the release success modal appeared"
  );
  ok(
    (await waitFor(
      () => L.R.breadBalance(OUTSIDER),
      (v) => v > beneficiaryBefore
    )) -
      beneficiaryBefore ===
      pot,
    `the beneficiary received the whole pot (${formatEther(pot)} BREAD, overshoot included)`
  );
  ok((await R.goal.released(goalId)) === true, "released flag is set");
  ok(
    (await R.goal.state(goalId)) === GoalState.Released,
    "goalState == Released"
  );
  ok(
    (await R.goal.totalDeposited(goalId)) === 0n,
    "the goal holds nothing after the release"
  );

  /* ------------------------------------------------------------------ 6 -- */
  head("6) a second goal in reclaim mode refunds its members");
  const deadlineB = await futureDeadline(1);
  const { id: goalB, created: createdB } = await createGoal(op, {
    name: `E2E Reclaim Goal ${Date.now() % 100000}`,
    members: 2,
    amount: RECLAIM_AMOUNT,
    deadline: deadlineB,
    beneficiary: null,
  });
  ok(createdB, "the second goal was created");
  const goalBInfo = await R.goal.getGoal(goalB);
  ok(
    goalBInfo.beneficiary === zeroAddress,
    "reclaim mode stored the zero address as beneficiary"
  );

  await op.keyboard.press("Escape");
  await U.beat(800);
  await U.goto(op, `/goals/${goalB}`, 3500);
  panel = U.section(op, "Your contribution");
  await U.fillPlaceholder(panel, "Amount", formatEther(RECLAIM_AMOUNT));
  ok(
    await U.runTx(op, {
      scope: panel,
      open: "Deposit",
      confirm: "Deposit",
      success: "Deposit successful",
    }),
    "the deposit success modal appeared"
  );
  ok(
    (await waitFor(
      () => R.goal.state(goalB),
      (v) => v === GoalState.Funded
    )) === GoalState.Funded,
    "the reclaim goal reached its target (state Funded)"
  );

  const beforeRefund = await L.R.breadBalance(ownerAddr);
  await U.goto(op, `/goals/${goalB}`, 3000);
  panel = U.section(op, "Your contribution");
  ok(
    await U.runTx(op, {
      scope: panel,
      open: "Withdraw everything",
      confirm: "Withdraw",
      success: "Withdrawal successful",
    }),
    "the withdrawal success modal appeared"
  );
  ok(
    (await waitFor(
      () => R.goal.contribution(goalB, ownerAddr),
      (v) => v === 0n
    )) === 0n,
    "the contribution is back to 0 on chain"
  );
  ok(
    (await L.R.breadBalance(ownerAddr)) - beforeRefund === RECLAIM_AMOUNT,
    `the wallet was refunded exactly ${formatEther(RECLAIM_AMOUNT)} BREAD`
  );
  ok(
    (await R.goal.totalDeposited(goalB)) === 0n,
    "the reclaim goal is empty again"
  );

  console.log("\n  videos:");
  console.log("   ", await ownerSession.close());
  console.log("   ", await memberSession.close());
  process.exit(finish(`Goal #${goalId} + reclaim goal #${goalB}`));
})().catch((error) => {
  console.error("FATAL", error);
  process.exit(1);
});
