/* ASCA (savings & credit fund) — full member lifecycle through the REAL UI.
 *
 * Every step is performed by clicking the app's own buttons and filling its own
 * forms with an injected key-backed wallet, then asserted by an INDEPENDENT
 * viem read against the chain (never via the app):
 *
 *   create (via /new type picker)  -> FundCreated + getFund config
 *   invite + join (second wallet)  -> isMember + usedNonces + roster
 *   deposit (both wallets)         -> savings / totalSavings / poolCash
 *   borrow                         -> loan principal + dueDate + tokens moved
 *   repay (after a time warp)      -> principal 0 + interest distributed
 *   claim interest                 -> tokens moved, nothing pending left
 *   withdraw                       -> savings back to 0
 */
const { formatEther } = require("viem");
const L = require("./lib.cjs");
const U = require("./ui.cjs");

const { R, A, ONE, ok, head, waitFor, finish, fork, same, findEvent } = L;

const NAME = `E2E Credit Fund ${Date.now() % 100000}`;
const MEMBERS = 2;
const BORROW_LIMIT_PCT = 50;
// Deliberately fractional: exercises the percent -> basis-points conversion
// and the formatBps round-trip back into the UI.
const INTEREST_PCT = 2.5;
const REPAYMENT_PERIODS = 2;
const PERIOD_SECONDS = 300n; // the "5 minutes" preset
const DEPOSIT = 20n * ONE;
const BORROW = 10n * ONE;

(async () => {
  const ownerSession = await U.openSession("asca-owner", L.owner);
  const memberSession = await U.openSession("asca-member", L.member);
  const ownerAddr = L.owner.account.address;
  const memberAddr = L.member.account.address;
  const op = ownerSession.page;
  const mp = memberSession.page;

  const fromBlock = await L.pub.getBlockNumber();
  const idBefore = await R.asca.nextId();

  /* ------------------------------------------------------------------ 1 -- */
  head("1) create the fund through the real /new flow");
  await U.goto(op, "/new");
  ok(
    (await op.getByText("What kind of stack?").count()) > 0,
    "the stack type picker is on /new"
  );
  await U.clickLink(op, "Savings & credit fund", 2500);
  ok(
    await U.waitForUrl(op, "/new/asca"),
    `picker routed to the ASCA form (${op.url()})`
  );

  await U.fillField(op, "name", NAME);
  await U.fillField(op, "members", MEMBERS);
  await U.fillField(op, "borrowLimit", BORROW_LIMIT_PCT);
  await U.fillField(op, "interestRate", INTEREST_PCT);
  await op.locator('input[value="5mins"]').first().check();
  await U.beat(400);
  await U.fillField(op, "repaymentPeriods", REPAYMENT_PERIODS);
  await U.beat(900);
  await U.click(op, "Create Fund", 1500);

  const created = await U.waitForText(
    op,
    /Savings & credit fund created|Fund Creation Failed/i
  );
  ok(
    /Savings & credit fund created/i.test(created),
    "the creation success modal appeared"
  );

  const fundId = idBefore;
  ok(
    (await R.asca.nextId()) === idBefore + 1n,
    `nextId advanced to ${idBefore + 1n}`
  );

  const fund = await R.asca.getFund(fundId);
  ok(same(fund.owner, ownerAddr), "getFund.owner is the creating wallet");
  ok(same(fund.token, A.bread), "getFund.token is BREAD");
  ok(
    fund.borrowLimitBps === BigInt(BORROW_LIMIT_PCT * 100),
    `getFund.borrowLimitBps == ${BORROW_LIMIT_PCT * 100} (${fund.borrowLimitBps})`
  );
  ok(
    fund.interestRateBps === BigInt(Math.round(INTEREST_PCT * 100)),
    `getFund.interestRateBps == ${Math.round(INTEREST_PCT * 100)} (${fund.interestRateBps}) from a fractional ${INTEREST_PCT}%`
  );
  ok(
    fund.repaymentPeriods === BigInt(REPAYMENT_PERIODS),
    `getFund.repaymentPeriods == ${REPAYMENT_PERIODS}`
  );
  ok(
    fund.periodLength === PERIOD_SECONDS,
    `getFund.periodLength == ${PERIOD_SECONDS}s`
  );
  ok(fund.deactivated === false, "the fund is active");

  const createdEvent = await findEvent({
    address: A.asca,
    abi: L.abis.asca,
    eventName: "FundCreated",
    fromBlock,
    match: (args) => args.id === fundId,
  });
  ok(
    !!createdEvent && same(createdEvent.args.owner, ownerAddr),
    "FundCreated was emitted for this id by the connected wallet"
  );
  ok(
    (await R.asca.members(fundId)).length === 1,
    "roster starts with the creator only"
  );

  /* ------------------------------------------------------------------ 2 -- */
  head("2) invite a second wallet from the success modal and redeem it");
  const links = await waitFor(
    () => U.readInviteLinks(op),
    (l) => l.length >= MEMBERS - 1,
    120000
  );
  ok(
    links.length === MEMBERS - 1,
    `the modal rendered ${MEMBERS - 1} signed invite link(s)`
  );
  const inviteUrl = new URL(links[0]);
  ok(inviteUrl.searchParams.get("type") === "asca", "invite carries type=asca");
  ok(
    same(inviteUrl.searchParams.get("contract"), A.asca),
    "invite points at the ASCA contract"
  );
  ok(
    inviteUrl.searchParams.get("circleId") === fundId.toString(),
    `invite carries circleId=${fundId}`
  );
  const nonce = BigInt(inviteUrl.searchParams.get("nonce"));
  ok(
    (await R.asca.usedNonce(fundId, nonce)) === false,
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
      () => R.asca.isMember(fundId, memberAddr),
      (v) => v === true
    )) === true,
    "isMember(second wallet) is true on chain"
  );
  ok(
    (await R.asca.usedNonce(fundId, nonce)) === true,
    "the invite nonce is now spent"
  );
  ok((await R.asca.members(fundId)).length === 2, "roster now has 2 members");

  /* ------------------------------------------------------------------ 3 -- */
  head("3) both members deposit savings");
  for (const [label, session, addr] of [
    ["owner", ownerSession, ownerAddr],
    ["second member", memberSession, memberAddr],
  ]) {
    const page = session.page;
    await U.goto(page, `/ascas/${fundId}`, 3500);
    const savingsPanel = U.section(page, "Your savings");
    const before = await L.R.breadBalance(addr);
    await U.fillPlaceholder(savingsPanel, "Amount", formatEther(DEPOSIT));
    const good = await U.runTx(page, {
      scope: savingsPanel,
      open: "Deposit",
      confirm: "Deposit",
      success: "Deposit successful",
    });
    ok(good, `${label}: the deposit success modal appeared`);
    ok(
      (await waitFor(
        () => R.asca.savings(fundId, addr),
        (v) => v === DEPOSIT
      )) === DEPOSIT,
      `${label}: savings == ${formatEther(DEPOSIT)} BREAD on chain`
    );
    ok(
      before - (await L.R.breadBalance(addr)) === DEPOSIT,
      `${label}: spent exactly ${formatEther(DEPOSIT)} BREAD`
    );
  }

  let [totalSavings, totalBorrowed, poolCash] = await R.asca.balances(fundId);
  ok(
    totalSavings === 2n * DEPOSIT,
    `totalSavings == ${formatEther(2n * DEPOSIT)}`
  );
  ok(poolCash === 2n * DEPOSIT, `poolCash == ${formatEther(2n * DEPOSIT)}`);
  ok(totalBorrowed === 0n, "totalBorrowed == 0");
  ok(
    (await R.asca.creditLine(fundId, ownerAddr)) === DEPOSIT / 2n,
    `creditLineOf(owner) == ${BORROW_LIMIT_PCT}% of savings`
  );

  /* ------------------------------------------------------------------ 4 -- */
  head("4) the owner borrows against their own savings");
  const borrowBlock = await L.pub.getBlockNumber();
  const balBeforeBorrow = await L.R.breadBalance(ownerAddr);
  await U.goto(op, `/ascas/${fundId}`, 3000);
  ok(
    /2\.5% per period/i.test(await U.bodyText(op)),
    "the fund page renders the fractional rate back as 2.5% per period"
  );
  const loanPanel = U.section(op, "Your credit line");
  await U.fillPlaceholder(loanPanel, "Amount", formatEther(BORROW));
  ok(
    await U.runTx(op, {
      scope: loanPanel,
      open: "Borrow",
      confirm: "Borrow",
      success: "Loan opened",
    }),
    "the borrow success modal appeared"
  );

  const [loan, dueDate] = await waitFor(
    () => R.asca.loan(fundId, ownerAddr),
    ([l]) => l.principal === BORROW
  );
  ok(
    loan.principal === BORROW,
    `loan principal == ${formatEther(BORROW)} BREAD`
  );
  const borrowedEvent = await findEvent({
    address: A.asca,
    abi: L.abis.asca,
    eventName: "Borrowed",
    fromBlock: borrowBlock,
    match: (args) => args.id === fundId && same(args.member, ownerAddr),
  });
  ok(
    !!borrowedEvent && borrowedEvent.args.amount === BORROW,
    "Borrowed event carries the borrowed amount"
  );
  ok(
    !!borrowedEvent && borrowedEvent.args.dueDate === dueDate,
    "Borrowed.dueDate matches getLoan's dueDate"
  );
  const borrowTs = (
    await L.pub.getBlock({ blockNumber: borrowedEvent.log.blockNumber })
  ).timestamp;
  ok(
    dueDate === borrowTs + BigInt(REPAYMENT_PERIODS) * PERIOD_SECONDS,
    `dueDate == borrow time + ${REPAYMENT_PERIODS} periods`
  );
  ok(
    (await L.R.breadBalance(ownerAddr)) - balBeforeBorrow === BORROW,
    `the borrower received exactly ${formatEther(BORROW)} BREAD`
  );
  [totalSavings, totalBorrowed, poolCash] = await R.asca.balances(fundId);
  ok(totalBorrowed === BORROW, "totalBorrowed tracks the loan");
  ok(poolCash === 2n * DEPOSIT - BORROW, "poolCash was debited by the loan");

  /* ------------------------------------------------------------------ 5 -- */
  head("5) warp one period so interest accrues, then repay in full");
  await fork.increaseTime(Number(PERIOD_SECONDS) + 10);
  const [accruing] = await R.asca.loan(fundId, ownerAddr);
  ok(
    accruing.interestOwed > 0n,
    `interest accrued after one period (${formatEther(accruing.interestOwed)} BREAD)`
  );

  const repayBlock = await L.pub.getBlockNumber();
  await U.goto(op, `/ascas/${fundId}`, 3500);
  const loanPanel2 = U.section(op, "Your credit line");
  // Overpay: the contract caps the payment at the outstanding debt.
  await U.fillPlaceholder(loanPanel2, "Amount", "50");
  ok(
    await U.runTx(op, {
      scope: loanPanel2,
      open: "Repay",
      confirm: "Repay",
      success: "Repayment successful",
    }),
    "the repayment success modal appeared"
  );

  const [repaid] = await waitFor(
    () => R.asca.loan(fundId, ownerAddr),
    ([l]) => l.principal === 0n
  );
  ok(repaid.principal === 0n, "loan principal is 0 after repayment");
  [totalSavings, totalBorrowed, poolCash] = await R.asca.balances(fundId);
  ok(totalBorrowed === 0n, "totalBorrowed is back to 0");

  const repaidEvent = await findEvent({
    address: A.asca,
    abi: L.abis.asca,
    eventName: "Repaid",
    fromBlock: repayBlock,
    match: (args) => args.id === fundId && same(args.member, ownerAddr),
  });
  ok(
    !!repaidEvent && repaidEvent.args.principalPaid === BORROW,
    "Repaid settled the whole principal"
  );
  const interestPaid = repaidEvent ? repaidEvent.args.interestPaid : 0n;
  ok(
    interestPaid > 0n,
    `Repaid carried interest (${formatEther(interestPaid)} BREAD)`
  );
  ok((await R.asca.accPerShare(fundId)) > 0n, "accInterestPerShare grew");

  const pendingOwner = await R.asca.pendingInterest(fundId, ownerAddr);
  const pendingMember = await R.asca.pendingInterest(fundId, memberAddr);
  const distributed = pendingOwner + pendingMember;
  ok(
    interestPaid - distributed < 10n,
    `interest was distributed to both savers (${formatEther(pendingOwner)} + ${formatEther(
      pendingMember
    )} of ${formatEther(interestPaid)})`
  );

  /* ------------------------------------------------------------------ 6 -- */
  head("6) claim the earned interest");
  const balBeforeClaim = await L.R.breadBalance(ownerAddr);
  const savingsPanel2 = U.section(op, "Your savings");
  ok(
    await U.runTx(op, {
      scope: savingsPanel2,
      open: "Claim interest",
      confirm: "Claim interest",
      success: "Interest claimed",
    }),
    "the claim-interest success modal appeared"
  );
  ok(
    (await waitFor(
      () => L.R.breadBalance(ownerAddr),
      (v) => v > balBeforeClaim
    )) -
      balBeforeClaim ===
      pendingOwner,
    `claimed exactly the pending interest (${formatEther(pendingOwner)} BREAD)`
  );
  ok(
    (await R.asca.pendingInterest(fundId, ownerAddr)) === 0n,
    "nothing pending left after the claim"
  );

  /* ------------------------------------------------------------------ 7 -- */
  head("7) withdraw the savings back out");
  const balBeforeWithdraw = await L.R.breadBalance(ownerAddr);
  await U.goto(op, `/ascas/${fundId}`, 3000);
  const savingsPanel3 = U.section(op, "Your savings");
  await U.fillPlaceholder(savingsPanel3, "Amount", formatEther(DEPOSIT));
  ok(
    await U.runTx(op, {
      scope: savingsPanel3,
      open: "Withdraw",
      confirm: "Withdraw",
      success: "Withdrawal successful",
    }),
    "the withdrawal success modal appeared"
  );
  ok(
    (await waitFor(
      () => R.asca.savings(fundId, ownerAddr),
      (v) => v === 0n
    )) === 0n,
    "savings are back to 0 on chain"
  );
  ok(
    (await L.R.breadBalance(ownerAddr)) - balBeforeWithdraw === DEPOSIT,
    `the wallet got exactly ${formatEther(DEPOSIT)} BREAD back`
  );
  [totalSavings] = await R.asca.balances(fundId);
  ok(
    totalSavings === DEPOSIT,
    "totalSavings still holds the second member's deposit"
  );

  console.log("\n  videos:");
  console.log("   ", await ownerSession.close());
  console.log("   ", await memberSession.close());
  process.exit(finish(`ASCA fund #${fundId}`));
})().catch((error) => {
  console.error("FATAL", error);
  process.exit(1);
});
