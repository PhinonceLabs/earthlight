# Investigation: `/projects` server error after login on Vercel

## Summary
Drizzle migration `0000_shiny_sentinel.sql` was never applied to the Neon
Postgres database provisioned via the Vercel Marketplace integration. The
`/projects` server component renders by querying `app_users` / `projects`,
both of which don't exist yet — Postgres returns `relation "..." does not
exist` and Next.js surfaces it as the generic "A server error occurred"
page in production.

## Current State
The original failure was a missing explicit migration step after Neon
provisioning. A later build-time migration change solved that symptom but
created a new deployment fragility: ordinary Vercel builds became dependent
on database credentials, Neon reachability, and DDL success. The current
repository policy is to keep `npm run build` as a pure `next build` and run
Drizzle migrations through an explicit release step (`npm run db:migrate`) or
the opt-in serialized script (`npm run build:with-migrations`). Drizzle now
prefers `DATABASE_MIGRATION_URL`, then `DATABASE_URL_UNPOOLED`, then
`DATABASE_URL`, so migrations can use an unpooled Neon URL instead of the
pooled runtime connection.

## Symptoms
- User signs in via Clerk (dev keys), is redirected to
  `https://earthlight-erik-2407-erik-phinoncecoms-projects.vercel.app/projects`.
- Page renders: "This page couldn't load — A server error occurred."
- Console: `Uncaught Error: An error occurred in the Server Components
  render. The specific message is omitted in production builds…`
- Clerk dev-keys notice is unrelated noise.

## Investigator Findings

### Code path that fires on `/projects`
1. `src/proxy.ts:9-12` — Clerk middleware enforces auth on
   `/projects(.*)`. User is signed in, so it passes.
2. `src/app/(app)/layout.tsx:7` — `await auth.protect()`. Passes.
3. `src/app/(app)/projects/page.tsx:9` —
   `await listProjectsForCurrentIdentity()`.
4. `src/features/projects/queries.ts:41` — calls
   `requireAppIdentity()`.
5. `src/server/auth/identity.ts:82-89` — `requireAppIdentity`
   calls `getOrCreateCurrentAppUser`, which first runs
   `db.query.appUsers.findFirst({ where: eq(appUsers.clerkUserId, …) })`
   (`identity.ts:41-43`). This is the first DB query in the request.

### Vercel runtime logs (deployment `dpl_DDboNCtTieX2w1C5uM6UbcqTJoqh`,
production)
```
| Time     | Method | Path      | Status | Level | Message                          |
| 07:20:37 | GET    | /projects | 200    | error | Error: Failed query: select...   |
| 07:19:11 | GET    | /projects | 200    | error | Error: Failed query: select...   |
| 07:17:43 | GET    | /projects | 500    | error | Error: Failed query: select...   |
| 07:17:42 | GET    | /projects | 500    | error | Error: Failed query: select...   |
```
A substring search for `relation` matches the *same five log rows* as
`Failed query`, meaning the error body contains both words —
i.e. the classic Postgres `relation "app_users" does not exist` (or
`relation "projects" does not exist`). The Drizzle layer prefixes
`Failed query: …` to any failing SQL.

The `500 → 200` shift across attempts is Next.js error-boundary
behavior, not a different bug — same upstream query failure, same time
window.

### Env vars are configured
`vercel env ls production` shows the Neon Marketplace integration
provisioned ~30 min ago. `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, the
`POSTGRES_*` family, and all Clerk variables are present in
Production and Preview. So the import-time guard at
`src/server/db/index.ts:9-11` is **not** the source of the error — the
Neon HTTP driver successfully connects, then the query fails because
the schema is empty.

### Why the schema was empty
- The Neon DB was auto-provisioned by the Marketplace integration ~30
  min ago and was therefore empty. The local migration
  `src/server/db/migrations/0000_shiny_sentinel.sql` (which creates
  `app_users`, `projects`, `scenarios`, `roi_snapshots`,
  `report_snapshots` plus the `project_type` / `scenario_source`
  enums) had never been applied against it.
- The durable fix is not to hide DDL inside every app build. The release
  process must run `npm run db:migrate` explicitly, preferably with
  `DATABASE_MIGRATION_URL` or Vercel/Neon's `DATABASE_URL_UNPOOLED`.
- `npm run build` is intentionally just `next build`; `npm run
  build:with-migrations` exists only for environments that deliberately
  serialize migration and build work.

### Hypotheses eliminated
- **Missing `DATABASE_URL`** — `vercel env ls` lists it; the guard at
  `src/server/db/index.ts:9-11` would surface a different error
  ("DATABASE_URL is required…") not a Drizzle "Failed query".
- **Clerk dev-keys block production access** — the Clerk warning is
  informational. `auth.protect()` returned successfully (the request
  reaches the DB layer).
- **`onConflictDoUpdate` constraint failure** — the `findFirst`
  SELECT fails before the INSERT runs.
- **Authorization bug in `projectAccessWhere`** — code paths look
  correct, and the error fires regardless of access (the
  `findFirst` on `app_users` is the first failure).
- **Neon HTTP / connectivity** — `neon()` connected successfully (DB
  responded with an error, not a network timeout).

## Root Cause
The Neon Postgres database backing this Vercel project is **empty**.
`src/features/projects/queries.ts:41` → `requireAppIdentity()` →
`getOrCreateCurrentAppUser()` → `db.query.appUsers.findFirst(…)`
(`src/server/auth/identity.ts:41-43`) issues
`SELECT … FROM "app_users" WHERE "app_users"."clerk_user_id" = $1`,
and Postgres responds with `relation "app_users" does not exist`.
Drizzle re-throws as `Error: Failed query: select …`, which bubbles
out of the `(app)/projects` server component and triggers the
production server-render error page.

## Recommendations

### Fix now: apply the migration to the prod Neon DB
```bash
# from /Volumes/HomeX/erikschneider/earthlight
vercel link               # if not already linked (you are — .vercel/project.json present)
vercel env pull .env.local --environment=production
npm run db:migrate        # prefers DATABASE_MIGRATION_URL / DATABASE_URL_UNPOOLED / DATABASE_URL
```
Then reload `/projects`. The first request will INSERT the
`app_users` row (via `onConflictDoUpdate` on
`src/server/auth/identity.ts:55-72`) and return an empty project
list.

If you'd rather not pull prod creds locally, run the migration with an
explicit unpooled URL:
```bash
DATABASE_MIGRATION_URL='postgres://…unpooled…' npx drizzle-kit migrate
```
The unpooled URL avoids PgBouncer/DDL fragility for the migration pass.

### Keep app builds pure and migrations explicit
`npm run build` must remain `next build`. Running migrations inside every
Vercel build is a mistake that trades a missing-schema failure for a broader
class of deployment failures: preview builds without DB env, transient Neon
outages, migration lock contention, and DDL running from cacheable build jobs.

Use one of these explicit flows instead:

1. **Preferred release step:** run `npm run db:migrate` against the target
   database before deploying schema-dependent code or before first traffic.
2. **Opt-in serialized script:** run `npm run build:with-migrations` only in
   environments where intentionally coupling migration success to build success
   is acceptable.
3. **CI/deploy workflow:** run migrations from a one-off release job using
   `DATABASE_MIGRATION_URL` or `DATABASE_URL_UNPOOLED`, then run the normal
   Vercel build.

Also add a startup smoke-test (e.g. a `/api/health` route that does a trivial
`SELECT 1`) so the next missing-table case is caught before users see it.

## Preventive Measures
- Keep the "after provisioning Neon, run `npm run db:migrate`" step in the
  README / `CLAUDE.md` deploy sections.
- Prefer an unpooled migration URL (`DATABASE_MIGRATION_URL` or
  `DATABASE_URL_UNPOOLED`) over the pooled runtime `DATABASE_URL`.
- Add `migration applied` as an item on the bootstrap checklist invoked by
  `vercel:bootstrap` if that command is added.
- Consider a tiny `scripts/check-db.ts` invoked from CI that verifies the
  schema matches `drizzle-kit generate` output, so drift is caught at PR time,
  not at first user click.
