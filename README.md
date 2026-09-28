# Dearly Remembered

 KeepDearly, a small, warm, personal memory/reminder PWA.


## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

This project uses **npm** as its package manager (the `bun.lock`/`bunfig.toml`
files have been removed). `package-lock.json` is the source of truth — commit it
alongside any dependency change.

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Supabase setup (authentication)

KeepDearly stores accounts in Supabase. No credentials live in the repository:
only the publishable (`VITE_SUPABASE_ANON_KEY`) client key is committed, and it
is public by design — the RLS policies are what protect the data.

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the env template and fill in the values from **Project Settings → API**:

   ```sh
   cp .env.example .env.local   # copy .env.example .env.local on Windows
   ```

   Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (the public anon key).
   `.env.local` is git-ignored and carries the server-only secrets; the three
   public client values are committed in `.env.production`, which is the file
   `vite build` loads — so a deployed build always has them.

3. Run the Phase 1 schema in the Supabase **SQL editor** (or `supabase db push`):

   ```sql
   -- supabase/migrations/0001_create_profiles.sql
   ```

   It creates the `profiles` table, enables RLS, and adds the trigger that
   creates a profile whenever a new account signs up.

Until the SQL has been run and `.env.local` is filled in, the app runs but shows
a short "setup needed" notice instead of the signed-in screens.

## Reminder push delivery (Phase 4B)

Due reminders are delivered as Web Push by the `/api/reminders/due` endpoint.
Any scheduler that can send a periodic HTTP request can drive it:

```
external scheduler ──GET /api/reminders/due──▶ CRON_SECRET bearer check ──▶ delivery pass
```

1. Set the server-side variables documented in `.env.example` — `CRON_SECRET`,
   `SUPABASE_SERVICE_ROLE_KEY` and `VAPID_PRIVATE_KEY`. They are read from
   `process.env` only; never give them a `VITE_` prefix, which would bundle
   them into client code.
2. Deploy, then point the scheduler at the **production** URL:

   - **URL:** `https://<your-deployment>/api/reminders/due`. The path must
     match the route exactly — there is no cron configuration in this
     repository to edit.
   - **Method:** `GET`. `POST` is also accepted and is handy for manual
     testing; both run identical code behind the same check.
   - **Header:** `Authorization: Bearer <CRON_SECRET>`. The scheduler presents
     no other credential, so this header is the only thing protecting the
     endpoint; a mismatch answers `401` and delivers nothing.
   - **Secret:** set the scheduler's secret to the deployed `CRON_SECRET`
     **exactly** — any other value means every run is rejected.
   - **Schedule:** run it periodically. Once per minute is the intended
     cadence; a longer interval is safe, but due reminders wait for the next
     run.

3. Run `supabase/migrations/0004_reminder_push_delivery.sql` in the Supabase SQL
   editor — the atomic `notified_at` delivery claim. This is the only
   database-side change Phase 4B needs.

`0005_schedule_reminder_push_delivery.sql` is an **obsolete tombstone**: the
earlier pg_cron + pg_net + Supabase Vault scheduler was abandoned (this project
has no `supabase_vault` extension). It contains no executable statements and
must not be run.

With a missing or malformed secret the endpoint answers `503` and names the
variable — it never fakes a delivery. Locally you can exercise it with:

```sh
curl -X POST http://localhost:3000/api/reminders/due \
  -H "Authorization: Bearer $CRON_SECRET"
```
