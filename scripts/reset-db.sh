#!/usr/bin/env bash
#
# reset-db.sh — wipe and re-seed the development database in one shot.
#
# Order:
#   1. Try `db:seed:undo`  (best-effort — fails once Phase 1+ data references
#                          the demo tenant; we don't care because step 2 will
#                          drop every table anyway).
#   2. `db:migrate:undo:all`  — drops every table in reverse migration order.
#   3. `db:migrate`           — recreates every table.
#   4. `db:seed`              — seeds the demo tenant + Admin user.
#   5. `db:sync-permissions`  — idempotently materialises any new SYSTEM_ROLES
#                              and PERMISSIONS that landed since the seeder
#                              was written (e.g. BranchAdmin grants).
#
# Run from anywhere — the script cd's into backend/ relative to its own path.
#
#   chmod +x backend/scripts/reset-db.sh   # one-time
#   ./backend/scripts/reset-db.sh
#
# Or via the npm alias:  npm run db:reset

set -u  # error on undefined vars; we deliberately do NOT use `set -e` because
        # step 1 may fail by design.

# Move to backend/ regardless of where the script was invoked from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}/.." || exit 1

# ── Colours (skip if not a TTY) ─────────────────────────────────────────────
if [ -t 1 ]; then
  BOLD="$(printf '\033[1m')"
  CYAN="$(printf '\033[36m')"
  GREEN="$(printf '\033[32m')"
  YELLOW="$(printf '\033[33m')"
  RED="$(printf '\033[31m')"
  RESET="$(printf '\033[0m')"
else
  BOLD=""; CYAN=""; GREEN=""; YELLOW=""; RED=""; RESET=""
fi

step() {
  printf "\n${BOLD}${CYAN}==>${RESET} ${BOLD}%s${RESET}\n" "$1"
}

ok() {
  printf "${GREEN}✓${RESET} %s\n" "$1"
}

warn() {
  printf "${YELLOW}!${RESET} %s\n" "$1"
}

fail() {
  printf "${RED}✗ %s${RESET}\n" "$1" >&2
  exit 1
}

# ── 0. Refuse to run against anything that looks like production ────────────
#
# This script wipes every row in the DB. Run accidentally in prod and you've
# just deleted everyone's data. Defence in depth, three layers — any one
# failing aborts the script:
#
#   1. NODE_ENV must be `development` or `test`. Anything else (including
#      `production`, `staging`, or unset on a server with secrets baked in)
#      is refused.
#   2. DB host must be loopback / a docker-bridge address (127., localhost,
#      ::1, 172.). A remote IP / DNS name is treated as production.
#   3. DB name must NOT contain `prod`, `live`, or `main` (case-insensitive).
#      The seed/migrate steps target whatever DB_NAME points at — a typo'd
#      .env that points dev at prod must not bypass step 1+2.
#
# All three guards can be bypassed by setting `I_KNOW_I_AM_RESETTING=yes`,
# which is what you'd export in a sandboxed/ephemeral prod-like environment
# where reset is genuinely the right call (CI test DB, throwaway preview).
# Plus, on every run, an interactive confirmation that requires the operator
# to type the exact DB name. No flag combination skips the typed prompt.

OVERRIDE="${I_KNOW_I_AM_RESETTING:-}"

NODE_ENV_VALUE="${NODE_ENV:-development}"
case "${NODE_ENV_VALUE}" in
  development|test|local)
    ;;
  *)
    if [ "${OVERRIDE}" != "yes" ]; then
      fail "Refusing — NODE_ENV='${NODE_ENV_VALUE}' (only development|test|local allowed). Export I_KNOW_I_AM_RESETTING=yes to force."
    fi
    warn "NODE_ENV='${NODE_ENV_VALUE}' would normally be refused — override is set"
    ;;
esac

# Read DB host + name from the same dotenv the app loads. `node -p` keeps
# us off any shell-parser quirks with quoted values in .env.
DB_HOST_VALUE="$(node -p "require('dotenv').config(); process.env.DB_HOST || '127.0.0.1'" 2>/dev/null || echo '')"
DB_NAME_VALUE="$(node -p "require('dotenv').config(); process.env.DB_NAME || ''" 2>/dev/null || echo '')"

case "${DB_HOST_VALUE}" in
  127.*|localhost|::1|172.*|host.docker.internal|"")
    ;;
  *)
    if [ "${OVERRIDE}" != "yes" ]; then
      fail "Refusing — DB_HOST='${DB_HOST_VALUE}' is not local. Export I_KNOW_I_AM_RESETTING=yes to force."
    fi
    warn "DB_HOST='${DB_HOST_VALUE}' would normally be refused — override is set"
    ;;
esac

# Case-insensitive name check — matches `prod`, `production`, `live`, `main`.
DB_NAME_LOWER="$(printf '%s' "${DB_NAME_VALUE}" | tr '[:upper:]' '[:lower:]')"
case "${DB_NAME_LOWER}" in
  *prod*|*live*|*main*)
    if [ "${OVERRIDE}" != "yes" ]; then
      fail "Refusing — DB_NAME='${DB_NAME_VALUE}' looks like production. Export I_KNOW_I_AM_RESETTING=yes to force."
    fi
    warn "DB_NAME='${DB_NAME_VALUE}' would normally be refused — override is set"
    ;;
esac

# Typed confirmation — even local/dev resets ask once. Operator must type the
# exact DB name to proceed. No flag skips this; the cost of typing 12 chars
# is far less than the cost of a wrong reset.
#
# `read` only works on a TTY — when invoked from CI/cron without one, we
# refuse outright unless the override is set (a CI test job is exactly the
# case where the override should be exported).
if [ -t 0 ]; then
  printf "\n${YELLOW}About to wipe + reseed ${BOLD}%s${RESET}${YELLOW} at ${BOLD}%s${RESET}${YELLOW}.${RESET}\n" "${DB_NAME_VALUE:-<unset>}" "${DB_HOST_VALUE:-127.0.0.1}"
  printf "Type the DB name to confirm: "
  read -r CONFIRMED_NAME
  if [ "${CONFIRMED_NAME}" != "${DB_NAME_VALUE}" ]; then
    fail "Confirmation did not match — aborted."
  fi
else
  if [ "${OVERRIDE}" != "yes" ]; then
    fail "Refusing — no TTY for confirmation prompt. Export I_KNOW_I_AM_RESETTING=yes to run unattended."
  fi
fi

# ── 1. Undo seeders (best-effort) ───────────────────────────────────────────
step "1/5  Undo seeders (best-effort — FK errors expected on a populated DB)"
if npm run db:seed:undo; then
  ok "Seed undo complete"
else
  warn "Seed undo failed — moving on (step 2 drops the tables anyway)"
fi

# ── 2. Undo all migrations ──────────────────────────────────────────────────
step "2/5  Undo every migration"
npm run db:migrate:undo:all || fail "db:migrate:undo:all failed"
ok "All tables dropped"

# ── 3. Re-run all migrations ────────────────────────────────────────────────
step "3/5  Re-run all migrations"
npm run db:migrate || fail "db:migrate failed"
ok "Schema recreated"

# ── 4. Seed the demo tenant + Admin ─────────────────────────────────────────
step "4/5  Seed demo tenant + Admin user"
npm run db:seed || fail "db:seed failed"
ok "Demo tenant seeded"

# ── 5. Sync any newer SYSTEM_ROLES / PERMISSIONS into the seeded data ───────
step "5/5  Sync permissions (idempotent — BranchAdmin role, new grants, ...)"
npm run db:sync-permissions || fail "db:sync-permissions failed"
ok "Permissions synced"

printf "\n${GREEN}${BOLD}Database reset complete.${RESET}\n"
printf "Login: ${BOLD}admin@demo.test${RESET} / ${BOLD}Admin@123${RESET}\n"