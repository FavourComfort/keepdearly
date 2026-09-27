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

KeepDearly stores accounts in Supabase. No credentials live in the repository.

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the env template and fill in the values from **Project Settings → API**:

   ```sh
   cp .env.example .env.local   # copy .env.example .env.local on Windows
   ```

   Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (the public anon key).
   `.env.local` is git-ignored; only `.env.example` is committed.

3. Run the Phase 1 schema in the Supabase **SQL editor** (or `supabase db push`):

   ```sql
   -- supabase/migrations/0001_create_profiles.sql
   ```

   It creates the `profiles` table, enables RLS, and adds the trigger that
   creates a profile whenever a new account signs up.

Until the SQL has been run and `.env.local` is filled in, the app runs but shows
a short "setup needed" notice instead of the signed-in screens.

## Reminder push delivery (Phase 4B)

Due reminders are delivered as Web Push by `POST /api/reminders/due`, which a
scheduler invokes once per minute:

1. Set the server-side variables documented in `.env.example` — `CRON_SECRET`,
   `SUPABASE_SERVICE_ROLE_KEY` and `VAPID_PRIVATE_KEY`. They are read from
   `process.env` only; never give them a `VITE_` prefix, which would bundle
   them into client code.
2. Run `supabase/migrations/0004_reminder_push_delivery.sql` (the atomic
   `notified_at` delivery claim) and
   `supabase/migrations/0005_schedule_reminder_push_delivery.sql` (an every-minute
   pg_cron job that POSTs the endpoint with `pg_net`). Migration 0005's header
   explains the two Vault secrets it expects (`keepdearly_delivery_url`,
   `keepdearly_cron_secret`) and it reports in JSON if they are missing. The
   stored cron command contains no secrets: the job runs
   `public.keepdearly_run_reminder_delivery()`, which reads Vault and sends
   the `Authorization` header at execution time.
3. Alternatively, any external cron service can call the endpoint every minute
   with `Authorization: Bearer $CRON_SECRET`.

With a missing or malformed secret the endpoint answers `503` and names the
variable — it never fakes a delivery. Locally you can exercise it with:

```sh
curl -X POST http://localhost:3000/api/reminders/due \
  -H "Authorization: Bearer $CRON_SECRET"
```
