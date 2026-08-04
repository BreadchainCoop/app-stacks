/* Playwright plumbing shared by the journeys: a recorded browser session per
 * wallet, and small helpers for driving the REAL UI at a watchable pace (the
 * recordings are turned into docs GIFs, so every meaningful action is followed
 * by a short beat).
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { chromium } = require("playwright");
const { installWallet } = require("./inject.cjs");
const { BASE, CHAIN_ID } = require("./lib.cjs");

const ARTIFACTS = path.join(__dirname, "artifacts");
const VIEWPORT = { width: 1280, height: 800 };
const HEADED = !!process.env.HEADED;
/** Multiplier on every UI pause; raise it for smoother GIFs. */
const PACE = Number(process.env.TEST_PACE || 1);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function resolveChromium() {
  if (process.env.PW_EXECUTABLE_PATH) return process.env.PW_EXECUTABLE_PATH;
  const roots = [
    path.join(os.homedir(), "Library/Caches/ms-playwright"),
    path.join(os.homedir(), ".cache/ms-playwright"),
  ];
  for (const root of roots) {
    let dirs = [];
    try {
      dirs = fs
        .readdirSync(root)
        .filter((d) => /^chromium-\d+$/.test(d))
        .sort()
        .reverse();
    } catch {
      continue;
    }
    for (const dir of dirs)
      for (const rel of [
        "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
        "chrome-linux/chrome",
      ]) {
        const bin = path.join(root, dir, rel);
        if (fs.existsSync(bin)) return bin;
      }
  }
  return undefined;
}

/**
 * A browser session bound to one test wallet, recording video into
 * `artifacts/<label>.webm`.
 */
async function openSession(label, signer) {
  fs.mkdirSync(ARTIFACTS, { recursive: true });
  const videoDir = path.join(ARTIFACTS, `.rec-${label}`);
  fs.rmSync(videoDir, { recursive: true, force: true });

  const executablePath = resolveChromium();
  const browser = await chromium.launch({
    headless: !HEADED,
    ...(executablePath ? { executablePath } : {}),
  });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: videoDir, size: VIEWPORT },
  });
  await installWallet(context, signer, CHAIN_ID);

  const page = await context.newPage();
  page.on("pageerror", (e) =>
    console.log("    [pageerror]", String(e).slice(0, 200))
  );

  const session = {
    label,
    browser,
    context,
    page,
    signer,
    async close() {
      const video = page.video();
      await context.close();
      const target = path.join(ARTIFACTS, `${label}.webm`);
      try {
        const raw = await video.path();
        fs.rmSync(target, { force: true });
        fs.renameSync(raw, target);
      } catch {
        /* video may be missing if the browser died */
      }
      fs.rmSync(videoDir, { recursive: true, force: true });
      await browser.close();
      return target;
    },
  };
  return session;
}

/** Pause so the recording is watchable (and React has time to settle). */
const beat = (ms = 900) => sleep(Math.round(ms * PACE));

async function goto(page, route, settle = 2500) {
  await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
  await beat(settle);
}

/** `root` is a Page or any Locator, so clicks can be scoped to one panel. */
const button = (root, name) =>
  root.getByRole("button", { name, exact: false }).first();

async function click(root, name, after = 900) {
  const target = button(root, name);
  await target.waitFor({ state: "visible", timeout: 30000 });
  await target.scrollIntoViewIfNeeded();
  await target.click();
  await beat(after);
}

/**
 * The panel whose *heading* is exactly `title` (a RegExp works too, for
 * headings with a live count in them). Matching the heading rather than any
 * text matters: the detail pages stack several panels and the prose in one
 * often contains another's title.
 */
const section = (page, title) =>
  page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: title, exact: true }) })
    .first();

/** The modal currently on screen (Radix renders it in a portal). */
const dialog = (page) => page.getByRole("dialog");

async function clickLink(root, name, after = 1500) {
  const target = root.getByRole("link", { name, exact: false }).first();
  await target.waitFor({ state: "visible", timeout: 30000 });
  await target.scrollIntoViewIfNeeded();
  await target.click();
  await beat(after);
}

/**
 * Wait for a client-side navigation to land on `suffix`. The dev server
 * compiles routes on first hit, so a next/link click can take seconds to
 * change the URL — never assert on page.url() straight after the click.
 */
async function waitForUrl(page, suffix, timeout = 90000) {
  try {
    await page.waitForURL((url) => url.pathname.endsWith(suffix), { timeout });
    return true;
  } catch {
    return false;
  }
}

/** Fill a react-hook-form field by its `name` attribute. */
async function fillField(page, name, value) {
  const input = page.locator(`input[name="${name}"]`).first();
  await input.waitFor({ state: "visible", timeout: 30000 });
  await input.click();
  await input.fill(String(value));
  await input.blur().catch(() => {});
  await beat(320);
}

/** Fill an input located by placeholder text, optionally within a panel. */
async function fillPlaceholder(root, placeholder, value) {
  const input = root.getByPlaceholder(placeholder, { exact: false }).first();
  await input.waitFor({ state: "visible", timeout: 30000 });
  await input.click();
  await input.fill(String(value));
  await beat(320);
}

const bodyText = (page) =>
  page.evaluate(() => document.body.innerText.replace(/\s+/g, " "));

/** Wait until the page body matches `re`, then return the full text. */
async function waitForText(page, re, timeout = 120000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const text = await bodyText(page).catch(() => "");
    if (re.test(text)) return text;
    await sleep(1000);
  }
  return "";
}

/**
 * Drive one of the shared per-action tx modals end to end: click the button
 * that opens it (inside `scope`), confirm inside the modal, and wait for the
 * success (or failure) modal. Returns true when the success modal appeared.
 */
async function runTx(page, { scope, open, confirm, success, failure }) {
  await click(scope || page, open, 1200);
  await click(dialog(page), confirm, 800);
  const text = await waitForText(
    page,
    new RegExp(`${success}|${failure || "failed"}`, "i")
  );
  const good = new RegExp(success, "i").test(text);
  if (!good) console.log("    [tx modal]", text.slice(0, 300));
  await beat(1200);
  await page.keyboard.press("Escape");
  await beat(700);
  return good;
}

/** The invite URLs rendered by a creation-success modal, in order. */
async function readInviteLinks(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll("span.truncate")]
      .map((el) => el.textContent.trim())
      .filter((text) => text.startsWith("http"))
  );
}

module.exports = {
  ARTIFACTS,
  PACE,
  VIEWPORT,
  beat,
  bodyText,
  button,
  click,
  clickLink,
  dialog,
  fillField,
  fillPlaceholder,
  goto,
  openSession,
  readInviteLinks,
  runTx,
  section,
  sleep,
  waitForUrl,
  waitForText,
};
