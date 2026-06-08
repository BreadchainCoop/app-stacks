# CLAUDE.md

Guidance for Claude Code working in this repo.

**Project context — read first:** all stack, architecture, commands, conventions, and
guardrails live in **[AGENTS.md](./AGENTS.md)** (the canonical agent doc, shared with
Cursor/Copilot/Codex). Deeper references: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md),
[docs/SUPABASE.md](./docs/SUPABASE.md), and [CONTRIBUTING.md](./CONTRIBUTING.md).

The rest of this file is the behavioral playbook: _how_ to work, not _what_ the project
is. These are general rules to reduce common LLM coding mistakes.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use
judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

This repo has **no automated test suite**, so verification means the gates in
[AGENTS.md](./AGENTS.md#verification--how-to-check-your-work):

- `pnpm lint` clean, `pnpm build` succeeds (this is the type-check), formatting clean.
- For user-visible changes, run `pnpm dev` and confirm the behavior in the browser.

Transform tasks into verifiable goals:

- "Add validation" → "Define the invalid inputs; confirm each is now rejected."
- "Fix the bug" → "Reproduce it, fix it, confirm the repro path no longer triggers."
- "Refactor X" → "Confirm lint + build pass and behavior is unchanged before and after."

For multi-step tasks, state a brief plan:

```text
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work")
require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites
due to overcomplication, and clarifying questions come before implementation rather than
after mistakes.
