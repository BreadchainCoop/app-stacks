# Contributing to App-Stacks

Thanks for contributing! App-Stacks (Saving Circles) is a dApp for saving money together
with friends and family. This guide covers the workflow for both human contributors and
people contributing with the help of AI coding agents.

> **Using an AI agent?** Point it at [AGENTS.md](./AGENTS.md) — it contains the stack,
> conventions, commands, and guardrails agents need. `AGENTS.md` is read automatically by
> most agent tools (Cursor, Copilot, Codex), and Claude Code reads [CLAUDE.md](./CLAUDE.md)
> which links to it. You are responsible for everything your agent submits — review it as
> if you wrote it.

## Prerequisites

- [Node.js](https://nodejs.org/) v22+
- [pnpm](https://pnpm.io/) 11 (this repo uses pnpm; do not use npm or yarn)
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for contract / local
  chain work)
- [Git](https://git-scm.com/) and a Web3 wallet for testing

## Getting started

```bash
git clone https://github.com/BreadchainCoop/app-stacks.git
cd app-stacks
make update-contract-submodules   # pull contract submodules
pnpm install
cp .env.local.example .env.local  # then fill in the values
pnpm dev                          # http://localhost:3001
```

For the full local blockchain workflow (Anvil, deploying contracts, funding wallets,
time-travel for testing rounds), follow the [README](./README.md).

## Project layout

A short map lives in [AGENTS.md](./AGENTS.md#repository-map); the deeper walkthrough of how
the pieces fit together is in [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md). The Supabase
data model and privacy (RLS) rules are in [docs/SUPABASE.md](./docs/SUPABASE.md).

## Development workflow

1. **Open or pick an issue** describing the change. For larger work, discuss the approach
   first.
2. **Branch from `development`** (the default branch). Do not target `main`.
   ```bash
   git checkout development && git pull
   git checkout -b feat/short-description
   ```
3. **Make focused changes** that match the existing style (see Conventions below).
4. **Verify locally** before opening a PR (see Verifying your work).
5. **Open a PR into `development`** with a clear description of what changed and how you
   verified it.

## Conventions

The authoritative list is in [AGENTS.md](./AGENTS.md#conventions-follow-the-existing-code).
In short:

- Files are kebab-case; use the `@/*` import alias for `src/`.
- Read env vars only through `clientEnv` (`src/lib/env.ts`) or `serverEnv`
  (`src/lib/envs/server.ts`); add new ones to the Zod schema **and** `.env.local.example`.
- Never import server-only code or the Supabase service-role key into `"use client"` files.
  Service-role access lives only in `src/app/api/**`.
- Prefer `@breadcoop/ui` components and Tailwind utilities over hand-rolled UI.
- Keep on-chain amounts and timestamps as `bigint`; format only at the display edge.

## Verifying your work

This project has **no automated test suite**, so reviewers rely on these checks. Run them
before pushing:

```bash
pnpm lint          # must be clean
pnpm build         # must succeed (also type-checks)
pnpm format:check  # or run `pnpm format`
```

A pre-commit hook (husky + lint-staged) auto-formats and lints staged files, but run the
full commands above for anything non-trivial. For user-facing changes, also exercise the
feature in `pnpm dev` and note what you tested in the PR.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short summary>

feat: add invite-link expiry to stack creation
fix: correct deposit-window check for the final round
chore: bump @breadcoop/ui to 1.0.28
```

Common types: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `perf`. Reference the
issue number when fixing a specific issue (e.g. `fix: handle empty member list #42`).

## Pull requests

- Target the `development` branch.
- Keep the PR scoped to one logical change.
- Describe **what** changed, **why**, and **how you verified** it.
- Make sure `pnpm lint` and `pnpm build` pass.
- Don't commit secrets or `.env*` files, and don't edit contract submodules under
  `contracts/lib/**`.

## Security

If you find a security issue (especially anything affecting funds or Supabase RLS /
circle privacy), do **not** open a public issue. Contact the Breadchain team privately.
