#!/usr/bin/env bash
# Security gate: fail if a signing key ever reached the built app.
#
# The keys live only in the harness's Node process — the browser gets an
# EIP-1193 proxy, never a key. If one of them shows up in .next it means the
# app (or a stray env var) is carrying it, which must never happen.
OUT="${1:-$(cd "$(dirname "$0")/../.." && pwd)/.next}"
FAIL=0

echo "▸ bundle safety check ($OUT)"

if [ ! -d "$OUT" ]; then
  echo "  ! skipped: $OUT does not exist (build or run the app first)"
  exit 0
fi

for KEY in "$TEST_ADMIN_KEY" "$TEST_OWNER_KEY" "$TEST_MEMBER_KEY"; do
  [ -n "$KEY" ] || continue
  STRIPPED="${KEY#0x}"
  if grep -rIql -- "$STRIPPED" "$OUT" 2>/dev/null; then
    echo "  ✗ FAIL: a harness signing key is present in the built app"
    FAIL=1
  fi
done

[ "$FAIL" -eq 0 ] && echo "  ✓ no signing key in the built app"
exit "$FAIL"
