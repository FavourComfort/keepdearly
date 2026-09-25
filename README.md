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
