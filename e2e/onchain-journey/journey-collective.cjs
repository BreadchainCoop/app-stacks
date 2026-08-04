/* Collective fund — full member lifecycle through the REAL UI, asserted on chain.
 *
 *   create (via /new type picker)  -> FundCreated + getFund (on-chain name,
 *                                     voting period, approval threshold)
 *   invite + join (second wallet)  -> isMember + memberIndex + roster
 *   deposits from both wallets     -> sharesOf / totalShares / poolBalance
 *   propose a disbursement         -> snapshotted electorate + requiredYes
 *   vote from the second member    -> yesVotes, proposal Passed
 *   execute                        -> recipient paid, pool debited, Executed
 *   rage-quit withdraw             -> payout == floor(shares*pool/totalShares)
 */
const { formatEther } = require("viem");
const L = require("./lib.cjs");
const U = require("./ui.cjs");

const { R, A, ONE, OUTSIDER, ok, head, waitFor, finish, same, findEvent } = L;

/** Mirrors src/lib/collective-state.ts / ICollectiveFundCircles.ProposalState. */
const ProposalState = {
  Active: 0,
  Defeated: 1,
  Passed: 2,
  Executed: 3,
  Expired: 4,
};

const NAME = `E2E Collective ${Date.now() % 100000}`;
const VOTING_PERIOD = 300n; // the "5 minutes" preset
const THRESHOLD_BPS = 5100n; // the "Majority" preset (51%)
// Deliberately indivisible: 10 shares of 30 against a 23 BREAD pool leaves a
// remainder, so the pro-rata payout really exercises the contract's flooring.
const OWNER_DEPOSIT = 10n * ONE;
const MEMBER_DEPOSIT = 20n * ONE;
const PROPOSAL_AMOUNT = 7n * ONE;

(async () => {
  const ownerSession = await U.openSession("collective-owner", L.owner);
  const memberSession = await U.openSession("collective-member", L.member);
  const ownerAddr = L.owner.account.address;
  const memberAddr = L.member.account.address;
  const op = ownerSession.page;
  const mp = memberSession.page;

  const fromBlock = await L.pub.getBlockNumber();
  const idBefore = await R.collective.nextId();

  /* ------------------------------------------------------------------ 1 -- */
  head("1) create the fund through the real /new flow");
  await U.goto(op, "/new");
  await U.clickLink(op, "Collective fund", 2500);
  ok(
    await U.waitForUrl(op, "/new/collective"),
    `picker routed to the collective form (${op.url()})`
  );
  await U.fillField(op, "name", NAME);
  await U.fillField(op, "members", 2);
  await op.locator('input[value="5mins"]').first().check();
  await U.beat(400);
  await op.locator('input[value="majority"]').first().check();
  await U.beat(900);
  await U.click(op, "Create Fund", 1500);
  const created = await U.waitForText(
    op,
    /Collective fund created|Fund Creation Failed/i
  );
  ok(
    /Collective fund created/i.test(created),
    "the creation success modal appeared"
  );

  const fundId = idBefore;
  ok(
    (await R.collective.nextId()) === idBefore + 1n,
    `nextId advanced to ${idBefore + 1n}`
  );

  const fund = await R.collective.getFund(fundId);
  ok(same(fund.owner, ownerAddr), "getFund.owner is the creating wallet");
  ok(same(fund.token, A.bread), "getFund.token is BREAD");
  ok(fund.name === NAME, `getFund.name is the on-chain name "${fund.name}"`);
  ok(
    fund.votingPeriod === VOTING_PERIOD,
    `getFund.votingPeriod == ${VOTING_PERIOD}s`
  );
  ok(
    fund.approvalThresholdBps === THRESHOLD_BPS,
    `getFund.approvalThresholdBps == ${THRESHOLD_BPS} (Majority)`
  );
  ok(
    fund.totalShares === 0n && fund.poolBalance === 0n,
    "the fund starts empty"
  );
  const createdEvent = await findEvent({
    address: A.collective,
    abi: L.abis.collective,
    eventName: "FundCreated",
    fromBlock,
    match: (args) => args.id === fundId,
  });
  ok(
    !!createdEvent && createdEvent.args.name === NAME,
    "FundCreated carries the on-chain name"
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
  ok(
    inviteUrl.searchParams.get("type") === "collective",
    "invite carries type=collective"
  );
  ok(
    inviteUrl.searchParams.get("circleId") === fundId.toString(),
    `invite carries circleId=${fundId}`
  );
  const nonce = BigInt(inviteUrl.searchParams.get("nonce"));
  ok(
    (await R.collective.usedNonce(fundId, nonce)) === false,
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
      () => R.collective.isMember(fundId, memberAddr),
      (v) => v === true
    )) === true,
    "isMember(second wallet) is true on chain"
  );
  ok(
    (await R.collective.memberIndex(fundId, memberAddr)) === 1n,
    "the second wallet is roster index 1"
  );
  ok(
    (await R.collective.members(fundId)).length === 2,
    "roster now has 2 members"
  );

  /* ------------------------------------------------------------------ 3 -- */
  head("3) both members deposit into the pool");
  for (const [label, session, addr, amount] of [
    ["owner", ownerSession, ownerAddr, OWNER_DEPOSIT],
    ["second member", memberSession, memberAddr, MEMBER_DEPOSIT],
  ]) {
    const page = session.page;
    await U.goto(page, `/funds/${fundId}`, 3500);
    const panel = U.section(page, "Your position");
    const before = await L.R.breadBalance(addr);
    await U.fillPlaceholder(panel, "Amount", formatEther(amount));
    ok(
      await U.runTx(page, {
        scope: panel,
        open: "Deposit",
        confirm: "Deposit",
        success: "Deposit successful",
      }),
      `${label}: the deposit success modal appeared`
    );
    ok(
      (await waitFor(
        () => R.collective.shares(fundId, addr),
        (v) => v === amount
      )) === amount,
      `${label}: sharesOf == ${formatEther(amount)} (minted 1:1)`
    );
    ok(
      before - (await L.R.breadBalance(addr)) === amount,
      `${label}: spent exactly ${formatEther(amount)} BREAD`
    );
  }

  const pooled = OWNER_DEPOSIT + MEMBER_DEPOSIT;
  let state = await R.collective.getFund(fundId);
  ok(state.totalShares === pooled, `totalShares == ${formatEther(pooled)}`);
  ok(state.poolBalance === pooled, `poolBalance == ${formatEther(pooled)}`);

  /* ------------------------------------------------------------------ 4 -- */
  head("4) the owner proposes a disbursement");
  await U.goto(op, `/funds/${fundId}`, 3500);
  const proposalForm = U.section(op, "New proposal");
  await U.fillPlaceholder(proposalForm, "0x… recipient address", OUTSIDER);
  await U.fillPlaceholder(proposalForm, "Amount", formatEther(PROPOSAL_AMOUNT));
  await U.fillPlaceholder(
    proposalForm,
    "What is this payment for?",
    "E2E rent support"
  );
  ok(
    await U.runTx(op, {
      scope: proposalForm,
      open: "Create proposal",
      confirm: "Create proposal",
      success: "Proposal created",
    }),
    "the proposal success modal appeared"
  );

  const proposalId = 0n;
  const proposal = await waitFor(
    () => R.collective.proposal(fundId, proposalId),
    (p) => p.amount === PROPOSAL_AMOUNT
  );
  ok(same(proposal.proposer, ownerAddr), "proposal.proposer is the owner");
  ok(
    same(proposal.recipient, OUTSIDER),
    "proposal.recipient is the typed address"
  );
  ok(
    proposal.amount === PROPOSAL_AMOUNT,
    `proposal.amount == ${formatEther(PROPOSAL_AMOUNT)} BREAD`
  );
  ok(
    proposal.description === "E2E rent support",
    "proposal.description round-trips"
  );
  ok(proposal.electorate === 2n, "electorate snapshot == 2 members");
  ok(
    proposal.requiredYes === 2n,
    "requiredYes == 2 (ceil of 51% of a 2-member electorate)"
  );
  ok(proposal.yesVotes === 1n, "the proposer auto-voted yes");
  ok(
    (await R.collective.hasVoted(fundId, proposalId, ownerAddr)) === true,
    "hasVoted(proposer) is true"
  );
  ok(
    (await R.collective.proposalState(fundId, proposalId)) ===
      ProposalState.Active,
    "proposalState == Active"
  );

  /* ------------------------------------------------------------------ 5 -- */
  head("5) the second member votes yes");
  await U.goto(mp, `/funds/${fundId}`, 3500);
  const proposalsPanel = U.section(mp, /^Proposals/);
  ok(
    await U.runTx(mp, {
      scope: proposalsPanel,
      open: "Vote yes",
      confirm: "Vote",
      success: "Vote cast",
    }),
    "the vote success modal appeared"
  );
  ok(
    (
      await waitFor(
        () => R.collective.proposal(fundId, proposalId),
        (p) => p.yesVotes === 2n
      )
    ).yesVotes === 2n,
    "yesVotes == 2"
  );
  ok(
    (await R.collective.hasVoted(fundId, proposalId, memberAddr)) === true,
    "hasVoted(second member) is true"
  );
  ok(
    (await R.collective.proposalState(fundId, proposalId)) ===
      ProposalState.Passed,
    "proposalState == Passed"
  );
  ok(
    /2 yes \/ 2 required/i.test(await U.bodyText(mp)),
    "the proposal card renders the on-chain tally (2 yes / 2 required)"
  );

  /* ------------------------------------------------------------------ 6 -- */
  head("6) execute the proposal and pay the recipient");
  const recipientBefore = await L.R.breadBalance(OUTSIDER);
  await U.goto(mp, `/funds/${fundId}`, 3500);
  const proposalsPanel2 = U.section(mp, /^Proposals/);
  ok(
    await U.runTx(mp, {
      scope: proposalsPanel2,
      open: "Execute",
      confirm: "Execute",
      success: "Proposal executed",
    }),
    "the execute success modal appeared"
  );
  ok(
    (await waitFor(
      () => L.R.breadBalance(OUTSIDER),
      (v) => v > recipientBefore
    )) -
      recipientBefore ===
      PROPOSAL_AMOUNT,
    `the recipient received exactly ${formatEther(PROPOSAL_AMOUNT)} BREAD`
  );
  state = await R.collective.getFund(fundId);
  ok(
    state.poolBalance === pooled - PROPOSAL_AMOUNT,
    `poolBalance debited to ${formatEther(pooled - PROPOSAL_AMOUNT)}`
  );
  ok(
    state.totalShares === pooled,
    "totalShares is untouched by the disbursement"
  );
  ok(
    (await R.collective.proposal(fundId, proposalId)).executed === true,
    "proposal.executed is true"
  );
  ok(
    (await R.collective.proposalState(fundId, proposalId)) ===
      ProposalState.Executed,
    "proposalState == Executed"
  );

  /* ------------------------------------------------------------------ 7 -- */
  head("7) rage-quit: burn every share for a pro-rata slice of the pool");
  const poolBefore = state.poolBalance;
  const sharesBefore = state.totalShares;
  const expectedPayout = (OWNER_DEPOSIT * poolBefore) / sharesBefore;
  ok(
    (OWNER_DEPOSIT * poolBefore) % sharesBefore !== 0n,
    "the split has a remainder, so flooring is actually exercised"
  );
  ok(
    (await R.collective.previewWithdraw(fundId, ownerAddr)) === expectedPayout,
    `previewWithdraw agrees with floor(shares*pool/totalShares) = ${formatEther(
      expectedPayout
    )}`
  );

  const balanceBefore = await L.R.breadBalance(ownerAddr);
  await U.goto(op, `/funds/${fundId}`, 3500);
  const position = U.section(op, "Your position");
  await U.fillPlaceholder(
    position,
    "Shares to burn",
    formatEther(OWNER_DEPOSIT)
  );
  ok(
    await U.runTx(op, {
      scope: position,
      open: "Withdraw",
      confirm: "Withdraw",
      success: "Withdrawal successful",
    }),
    "the withdrawal success modal appeared"
  );
  ok(
    (await waitFor(
      () => R.collective.shares(fundId, ownerAddr),
      (v) => v === 0n
    )) === 0n,
    "the owner holds no shares any more"
  );
  ok(
    (await L.R.breadBalance(ownerAddr)) - balanceBefore === expectedPayout,
    `paid out exactly floor(shares*pool/totalShares) = ${formatEther(
      expectedPayout
    )} BREAD`
  );
  state = await R.collective.getFund(fundId);
  ok(
    state.totalShares === sharesBefore - OWNER_DEPOSIT,
    "totalShares dropped by the burned shares"
  );
  ok(
    state.poolBalance === poolBefore - expectedPayout,
    "poolBalance dropped by exactly the payout"
  );

  console.log("\n  videos:");
  console.log("   ", await ownerSession.close());
  console.log("   ", await memberSession.close());
  process.exit(finish(`Collective fund #${fundId}`));
})().catch((error) => {
  console.error("FATAL", error);
  process.exit(1);
});
