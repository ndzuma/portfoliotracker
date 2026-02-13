#!/usr/bin/env bash
#
# test-railway-webhook.sh
# ───────────────────────
# End-to-end test for the Railway deploy webhook pipeline.
# Tests each layer independently so you can pinpoint failures.
#
# Usage:
#   ./scripts/test-railway-webhook.sh [BASE_URL]
#
# Examples:
#   ./scripts/test-railway-webhook.sh                  # defaults to http://localhost:3000
#   ./scripts/test-railway-webhook.sh http://localhost:3000
#   ./scripts/test-railway-webhook.sh https://app.pulsefolio.net
#

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
ENDPOINT="${BASE_URL}/api/railway-deploy"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

pass=0
fail=0

log_header() {
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "${BOLD}  $1${RESET}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}

log_test() {
  echo ""
  echo -e "${YELLOW}▸ TEST $1${RESET}"
  echo -e "${DIM}  $2${RESET}"
}

log_pass() {
  echo -e "${GREEN}  ✓ PASS${RESET} — $1"
  pass=$((pass + 1))
}

log_fail() {
  echo -e "${RED}  ✗ FAIL${RESET} — $1"
  fail=$((fail + 1))
}

log_detail() {
  echo -e "${DIM}  $1${RESET}"
}

# ─── Test 1: Exact webhook.site payload (empty details, no service/deployment in resource) ──
log_header "Railway Webhook Test Suite"
echo -e "  Target: ${BOLD}${ENDPOINT}${RESET}"

log_test "1/6" "Exact webhook.site payload — Deployment.deployed with empty details"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Deployment.deployed",
    "severity": "info",
    "timestamp": "2026-02-13T12:53:45.567Z",
    "resource": {
      "workspace": { "id": "33fde203-993f-4b40-8995-31fe0e30b8e4", "name": "Sample Workspace" },
      "project":   { "id": "4353287e-6f0a-45d1-9c26-23a74340a1ea", "name": "pulseportfolio" },
      "environment": { "id": "env-sample", "name": "production", "isEphemeral": false }
    },
    "details": {}
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

log_detail "HTTP $HTTP_CODE"
log_detail "$BODY"

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | grep -q '"success":true'; then
    log_pass "Webhook.site payload accepted (200, success)"
  else
    log_fail "Got 200 but response doesn't indicate success"
  fi
else
  log_fail "Expected 200, got $HTTP_CODE — empty details payload rejected"
fi

# ─── Test 2: GET readback after empty-details deploy ─────────────────
log_test "2/6" "GET readback — verify Convex persisted from empty-details payload"

sleep 1

RESPONSE=$(curl -s -w "\n%{http_code}" "$ENDPOINT")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

log_detail "HTTP $HTTP_CODE"
log_detail "$BODY"

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | grep -q '"status":"success"'; then
    log_pass "GET returns deployment with status 'success'"
  elif echo "$BODY" | grep -q '"deployment":null'; then
    log_fail "GET returns null — Convex mutation didn't persist"
  else
    log_fail "GET returned 200 but status is not 'success'"
  fi
else
  log_fail "GET failed with HTTP $HTTP_CODE"
fi

# ─── Test 3: Real deployment with full details ───────────────────────
log_test "3/6" "Real deployment POST — full details with branch, commit, service"

DEPLOY_ID="test-$(date +%s)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"Deployment.deployed\",
    \"severity\": \"INFO\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
    \"details\": {
      \"id\": \"${DEPLOY_ID}\",
      \"branch\": \"main\",
      \"source\": \"GitHub\",
      \"status\": \"SUCCESS\",
      \"builder\": \"RAILPACK\",
      \"commitHash\": \"abc123def456\",
      \"repoSource\": \"ndzuma/portfoliotracker\",
      \"commitAuthor\": \"test-author\",
      \"commitMessage\": \"feat: test webhook integration\"
    },
    \"resource\": {
      \"project\":     { \"id\": \"proj-test\", \"name\": \"pulseportfolio\" },
      \"service\":     { \"id\": \"svc-test-001\", \"name\": \"Application\" },
      \"environment\": { \"id\": \"env-test\", \"name\": \"production\", \"isEphemeral\": false },
      \"deployment\":  { \"id\": \"${DEPLOY_ID}\" },
      \"workspace\":   { \"id\": \"ws-test\", \"name\": \"Test Workspace\" }
    }
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

log_detail "HTTP $HTTP_CODE"
log_detail "$BODY"

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | grep -q "$DEPLOY_ID"; then
    log_pass "Deployment recorded — response references $DEPLOY_ID"
  else
    log_pass "Deployment recorded (200) but response didn't echo ID"
  fi
else
  log_fail "Expected 200, got $HTTP_CODE — Convex mutation may have failed"
fi

# ─── Test 4: Deployment.redeployed type ──────────────────────────────
log_test "4/6" "Deployment.redeployed — should also be accepted"

REDEPLOY_ID="redeploy-$(date +%s)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"Deployment.redeployed\",
    \"severity\": \"INFO\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
    \"details\": {
      \"id\": \"${REDEPLOY_ID}\",
      \"branch\": \"hotfix/urgent\",
      \"status\": \"SUCCESS\",
      \"commitAuthor\": \"test-author\",
      \"commitMessage\": \"fix: hotfix redeploy\"
    },
    \"resource\": {
      \"project\":     { \"id\": \"proj-test\", \"name\": \"pulseportfolio\" },
      \"service\":     { \"id\": \"svc-test-001\", \"name\": \"Application\" },
      \"environment\": { \"id\": \"env-test\", \"name\": \"production\", \"isEphemeral\": false },
      \"deployment\":  { \"id\": \"${REDEPLOY_ID}\" },
      \"workspace\":   { \"id\": \"ws-test\", \"name\": \"Test Workspace\" }
    }
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

log_detail "HTTP $HTTP_CODE"
log_detail "$BODY"

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | grep -q "$REDEPLOY_ID"; then
    log_pass "Redeployed event recorded — response references $REDEPLOY_ID"
  else
    log_pass "Redeployed event accepted (200)"
  fi
else
  log_fail "Expected 200, got $HTTP_CODE"
fi

# Verify GET returns the redeployed event
sleep 1
GET_RESPONSE=$(curl -s "$ENDPOINT")

if echo "$GET_RESPONSE" | grep -q "$REDEPLOY_ID"; then
  log_pass "GET now returns the redeployed event ($REDEPLOY_ID)"
else
  log_fail "GET doesn't contain redeployed event ID"
fi

# ─── Test 5: Unknown event type — should be ignored, not 400 ────────
log_test "5/6" "Unknown event type — should be ignored with 200"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Volume.alert",
    "severity": "warning",
    "timestamp": "2026-02-13T12:00:00.000Z",
    "resource": {
      "workspace": { "id": "ws-test", "name": "Test Workspace" },
      "project":   { "id": "proj-test", "name": "pulseportfolio" }
    },
    "details": { "message": "Volume usage at 90%" }
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

log_detail "HTTP $HTTP_CODE"
log_detail "$BODY"

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | grep -qi "ignored\|Ignored"; then
    log_pass "Unknown event type ignored gracefully"
  else
    log_pass "Unknown event type returned 200"
  fi
else
  log_fail "Expected 200 (ignore), got $HTTP_CODE"
fi

# Verify GET still returns the redeployed event, not the volume alert
GET_RESPONSE=$(curl -s "$ENDPOINT")

if echo "$GET_RESPONSE" | grep -q "$REDEPLOY_ID"; then
  log_pass "Ignored event didn't overwrite the last deployment"
else
  log_fail "Last deployment was overwritten by ignored event"
fi

# ─── Test 6: Upsert — new deploy overwrites previous ────────────────
log_test "6/6" "Upsert — third deployment overwrites previous"

DEPLOY_ID_3="test-v3-$(date +%s)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"Deployment.deployed\",
    \"severity\": \"INFO\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
    \"details\": {
      \"id\": \"${DEPLOY_ID_3}\",
      \"branch\": \"feature/final-test\",
      \"status\": \"SUCCESS\",
      \"commitAuthor\": \"test-author\",
      \"commitMessage\": \"feat: upsert verification\"
    },
    \"resource\": {
      \"project\":     { \"id\": \"proj-test\", \"name\": \"pulseportfolio\" },
      \"service\":     { \"id\": \"svc-test-001\", \"name\": \"Application\" },
      \"environment\": { \"id\": \"env-test\", \"name\": \"production\", \"isEphemeral\": false },
      \"deployment\":  { \"id\": \"${DEPLOY_ID_3}\" },
      \"workspace\":   { \"id\": \"ws-test\", \"name\": \"Test Workspace\" }
    }
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

log_detail "HTTP $HTTP_CODE"
log_detail "$BODY"

sleep 1

GET_RESPONSE=$(curl -s "$ENDPOINT")

if echo "$GET_RESPONSE" | grep -q "$DEPLOY_ID_3"; then
  log_pass "Upsert works — GET returns latest deployment ($DEPLOY_ID_3)"
else
  log_fail "GET doesn't return latest deployment — upsert may be broken"
fi

if echo "$GET_RESPONSE" | grep -q "feature/final-test"; then
  log_pass "Branch field updated to 'feature/final-test'"
else
  log_fail "Branch field not updated"
fi

# ─── Summary ─────────────────────────────────────────────────────────
log_header "Results"

TOTAL=$((pass + fail))
echo ""
if [ "$fail" -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}All $TOTAL tests passed ✓${RESET}"
else
  echo -e "  ${GREEN}$pass passed${RESET}  ${RED}$fail failed${RESET}  (${TOTAL} total)"
fi
echo ""

if [ "$fail" -gt 0 ]; then
  echo -e "${YELLOW}  Troubleshooting:${RESET}"
  echo -e "${DIM}  1. Is the dev server running?  →  npm run dev"
  echo -e "  2. Is Convex running?          →  npx convex dev"
  echo -e "  3. Is NEXT_PUBLIC_CONVEX_URL set in .env.local?"
  echo -e "  4. Check the terminal running 'next dev' for error logs${RESET}"
  echo ""
  exit 1
fi
