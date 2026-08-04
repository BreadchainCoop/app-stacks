#!/usr/bin/env bash
# One command, three on-chain journeys.
#
# Brings up (or reuses) the anvil Gnosis fork and the dev server in local E2E
# wallet mode, funds the two test wallets, then drives the REAL UI for each new
# stack type and asserts every step with independent on-chain reads. Anything
# this script starts, it stops again on exit.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
APP="$(cd "$HERE/../.." && pwd)"

RPC_PORT="${RPC_PORT:-8545}"
WEB_PORT="${WEB_PORT:-3001}"
FORK_RPC="${FORK_RPC_URL:-https://rpc.gnosischain.com}"
CHAIN_ID="${CHAIN_ID:-31337}"
# Optional: prepend a node bin dir (e.g. an nvm install) to PATH.
NODE_BIN="${NODE_BIN:-}"
# bare pnpm on some machines is v8 and corrupts the lockfile — always pin.
PNPM="${PNPM:-npx pnpm@11.0.0}"

export TEST_RPC_URL="http://localhost:${RPC_PORT}"
export TEST_BASE_URL="http://localhost:${WEB_PORT}"
# Public anvil dev keys: funded only on the local fork, deliberately not secret.
# NEVER point this at a real network or use a funded key here.
export TEST_ADMIN_KEY="${TEST_ADMIN_KEY:-0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80}"
export TEST_OWNER_KEY="${TEST_OWNER_KEY:-0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d}"
export TEST_MEMBER_KEY="${TEST_MEMBER_KEY:-0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a}"

[ -d "$NODE_BIN" ] && export PATH="$NODE_BIN:$PATH"

ANVIL_PID=""; WEB_PID=""
cleanup() {
  [ -n "$ANVIL_PID" ] && kill "$ANVIL_PID" 2>/dev/null
  [ -n "$WEB_PID" ] && kill "$WEB_PID" 2>/dev/null
  return 0
}
trap cleanup EXIT

rpc_up() {
  curl -s -m 3 -X POST "$TEST_RPC_URL" -H 'content-type: application/json' \
    -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}' \
    2>/dev/null | grep -q result
}
# Generous timeout on purpose: `next dev` compiles a route on first request,
# which can take far longer than a normal HTTP timeout. A short one here would
# wrongly conclude nothing is listening and start a second, redundant server.
web_up() {
  curl -s -o /dev/null -m 120 -w '%{http_code}' "$TEST_BASE_URL/" 2>/dev/null \
    | grep -q '^[23]'
}

echo "▸ anvil (Gnosis fork, chain ${CHAIN_ID}) on :${RPC_PORT}"
if rpc_up; then
  echo "  reusing the anvil already listening on :${RPC_PORT}"
else
  anvil --fork-url "$FORK_RPC" --chain-id "$CHAIN_ID" --port "$RPC_PORT" \
    --block-time 5 >/tmp/stacks-journey-anvil.log 2>&1 &
  ANVIL_PID=$!
  for _ in $(seq 1 60); do rpc_up && break; sleep 1; done
  rpc_up || { echo "  ✗ anvil never came up — see /tmp/stacks-journey-anvil.log"; exit 1; }
  echo "  started anvil (pid $ANVIL_PID)"
fi

echo "▸ dev server on :${WEB_PORT} (local E2E wallet mode)"
if web_up; then
  echo "  reusing the server already listening on :${WEB_PORT}"
else
  ( cd "$APP" && NEXT_PUBLIC_E2E_WALLET=true $PNPM dev ) \
    >/tmp/stacks-journey-web.log 2>&1 &
  WEB_PID=$!
  for _ in $(seq 1 120); do web_up && break; sleep 1; done
  web_up || { echo "  ✗ dev server never came up — see /tmp/stacks-journey-web.log"; exit 1; }
  echo "  started dev server (pid $WEB_PID)"
fi

echo "▸ pre-flight: contracts, E2E gate, wallet funding"
node "$HERE/setup.cjs" || exit 1

CODE=0
for JOURNEY in asca goal collective; do
  echo ""
  echo "▸ ${JOURNEY} journey"
  node "$HERE/journey-${JOURNEY}.cjs" || CODE=1
done

echo ""
bash "$HERE/check-bundle.sh" || CODE=1

echo ""
if [ "$CODE" -eq 0 ]; then
  echo "▸ ALL THREE JOURNEYS PASS — videos in $HERE/artifacts"
else
  echo "▸ FAILURES above"
fi
exit "$CODE"
