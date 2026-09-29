# BWAT.md

This file provides guidance to Bwat when working with code in this repository.

## Tech Stack

- **KeepDearly** — a warm, personal memory/reminder PWA ("Dearly Remembered").
- Vite 8 + **TanStack Start** 1.168 / React Router 1.170 (SSR, file-based routes in `src/routes/`), `@tanstack/react-query` instantiated but **not** used for domain data.
- React 19, TypeScript 5.8 (`strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `noPropertyAccessFromIndexSignature`), ES2022.
- **Tailwind v4** via `@tailwindcss/vite` — CSS-first config in `src/styles.css` (`@theme` block, `@utility` rules). There is **no `tailwind.config.js`**; adding one will not be picked up.
- shadcn/ui, `new-york` style, `baseColor: slate`, `cssVariables: true` (config in `components.json` → `tailwind.css` is `src/styles.css`). Radix primitives, `class-variance-authority`, `lucide-react`, `sonner`, `react-hook-form` + `zod` + `@hookform/resolvers`, `date-fns`.
- `@supabase/supabase-js` — auth **and** data. No ORM, no Prisma, no SQL client other than Supabase.
- Nitro (build-only, Cloudflare Workers target) for server routes. Web Push is **hand-rolled on Web Crypto** (VAPID ES256 JWT per RFC 8292, `sealAes128gcm` per RFC 8291/8188) — there is no `web-push` npm dependency, do not add one.
- `packageManager: npm@11.11.0`; `package-lock.json` is the source of truth. `bun.lock`/`bunfig.toml` were removed — do not reintroduce them.

## Brand Identity

**Colors** — every color is a semantic token declared in the `@theme` block of `src/styles.css` (OKLCH, warm Material 3-inspired). **Never hardcode a hex value in a component**; the file says so explicitly.

- Primary (terracotta): `bg-primary` → `oklch(0.464 0.09 32.5)`, text `text-on-primary` → `oklch(1 0 0)`
- Primary container (soft/secondary action): `bg-primary-container` → `oklch(0.686 0.088 30.4)`, text `text-on-primary-container` → `oklch(0.36 0.079 32.2)`
- Primary fixed (hover for outline buttons): `bg-primary-fixed` → `oklch(0.906 0.036 30.5)`
- Secondary (muted sage): `bg-secondary` → `oklch(0.46 0.041 152)`, container `oklch(0.897 0.038 152)`
- Tertiary (used as the `primary` button hover): `bg-tertiary` → `oklch(0.483 0.078 33.4)`
- Background / surface: `bg-surface` → `oklch(0.982 0.006 84.6)` (warm off-white; `--color-background` is the same value)
- Surface ladder: `surface-dim` `oklch(0.882 …)`, `surface-container-low` `oklch(0.966 …)`, `-container` `0.948`, `-high` `0.928`, `-highest` `0.906`, `surface-variant` `0.906`, `surface-container-lowest` = pure white
- Foreground: `text-on-surface` → `oklch(0.247 0.006 132)`; muted text `text-on-surface-variant` → `oklch(0.406 0.023 33)`
- Border / outline: `outline` → `oklch(0.584 0.021 33.6)`, `outline-variant` → `oklch(0.816 0.026 30.3)`
- Error: `error` → `oklch(0.517 0.204 27.3)`, container `oklch(0.913 0.045 20.3)`
- The **only** literal hex values in the codebase are inside the inline `Logo` SVG in `src/components/keepdearly/AppShell.tsx` (`#FAF6F0`, `#F4EAE2`, `#D98E82`, `#B07167`). That is the one acceptable exception.

**Typography** (fonts are loaded as webfonts, not npm packages):
- Display / headings: `"Newsreader", Georgia, serif` — exposed as `--font-display`; used **only** through the custom utilities below, never as raw `font-serif`.
- Body / UI: `"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif` — `--font-sans`.
- Icons: **Material Symbols Outlined**, not lucide. Render via `<Icon name="favorite" filled />` (`src/components/keepdearly/Icon.tsx`), which applies the `ms-icon` / `ms-filled` utilities. `lucide-react` is only used inside stock `src/components/ui/*` shadcn primitives.
- Use the custom type-scale utilities; do not hand-write `text-[15px] leading-[24px]`. Defined in `src/styles.css`:
  - Display: `text-headline-xl` (30→40px) · `text-headline-lg` (26→32px) · `text-headline-md` (24px) · `text-headline-sm` (20px) · `text-quote-body` (18px)
  - Sans: `text-title-md` (16px/600) · `text-title-sm` (14px/600) · `text-body-lg` (17px) · `text-body-md` (15px) · `text-body-sm` (13px) · `text-label-md` (13px/500) · `text-label-sm` (11px/600, uppercase-ish, tracked)

**Geometry**:
- `--radius-DEFAULT: 0.25rem`, `--radius-lg: 0.5rem`, `--radius-xl: 0.75rem`, `--radius-2xl: 1rem`. Buttons, nav pills, and avatars are **`rounded-full`** regardless of the scale — the product's signature shape.
- Default Tailwind spacing scale. Layout is a centered `max-w-3xl` column (`px-4`), fixed 5rem-tall header and fixed bottom nav on mobile.
- Shadows are near-invisible warm tints: `shadow-sm`, `shadow-md`, and inline `shadow-[0_-2px_12px_rgba(0,0,0,0.03)]`. No heavy elevation.

**Visual language**: Warm, quiet, low-contrast — soft off-white surfaces, terracotta accents, serif headlines over a rounded sans UI, pill-shaped controls, `active:scale-95` press feedback, and generous whitespace. Mobile-first PWA with a bottom tab bar under `md` and a top nav at `md+`. Product components live in `src/components/keepdearly/`; `src/components/ui/` is unmodified shadcn — **do not restyle shadcn primitives**, put the brand styling in the `keepdearly/` wrapper instead.

## Coding Conventions

- **Path alias `@/*` → `src/*`** (`tsconfig.json` + `vite-tsconfig-paths`). Always import via `@/...`, never relative `../../`.
- Server-only modules use the **`*.server.ts` filename suffix**. `eslint.config.js:23-34` *bans* importing the `server-only` package — use the suffix or `@tanstack/react-start/server-only`. Never import a `*.server.ts` module from client code.
- `src/routeTree.gen.ts` is **auto-generated** — never hand-edit it. Add/remove routes by adding files in `src/routes/`.
- Components are **named exports** (`export function PrimaryButton`), never default exports. This keeps `react-refresh/only-export-components` clean.
- `PrimaryButton` takes a `variant: "primary" | "soft" | "quiet" | "outline"` rather than shadcn's `cva` variant API — the product wrapper is a plain `Record<Variant, string>`.
- `cn()` is `twMerge(clsx(...))` from `@/lib/utils` — use it for every conditional class list.
- Prettier: **printWidth 100**, double quotes, semicolons, `trailingComma: "all"`. `npm run format` formats everything except build output and `routeTree.gen.ts`.
- `noUnusedLocals`/`noUnusedParameters` are off, but `noUncheckedIndexedAccess` and `noPropertyAccessFromIndexSignature` are **on** — array access yields `T | undefined` and env/record access must use bracket notation.
- Hand-rolled date formatting in `src/lib/keepdearly-data.ts:126-132` is deliberate, not an oversight. Match that style rather than importing `date-fns` into a new file.

## Architecture Notes

**Vite config is not yours to edit.** `vite.config.ts` delegates to `defineConfig` from `@lovable.dev/vite-tanstack-config`, which already installs TanStack devtools, `tanstackStart`, React, Tailwind, `tsConfigPaths`, Nitro, `VITE_*` env injection, path aliasing, React/TanStack dedupe, error loggers, and sandbox detection. Adding any of these manually causes duplicate-plugin breakage (see the comment at `vite.config.ts:1-6`).

**Data flow.** `src/lib/keepdearly-store.tsx` is a single React context provider. It holds raw Supabase rows in `useState`, loads them with a `Promise.all` of three reads, and derives view models with `useMemo`. **Every mutation ends in `await load()`** — there are no cache keys and no query invalidation; do not add a parallel caching strategy. Row types come from `src/lib/supabase.types.ts`; view models (`Person`/`Memory`/`Reminder`/`ReminderBucket`) and mappers (`toMemoryView`/`toPersonView`/`toReminderView`) live in `src/lib/keepdearly-data.ts`. **Supabase is the source of truth — there is no localStorage.** A 60s `setInterval` tick exists solely so "overdue" badges re-derive as time passes.

**Auth.** `src/lib/supabase.ts` reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`; `isSupabaseConfigured` is the gate and `getSupabase()` is lazy and throws `SupabaseConfigError` when unconfigured (nothing is constructed during SSR). `src/lib/auth.tsx` provides the session via `getSession()` + `onAuthStateChange`, with status starting as `"loading"` so a refresh never flashes signed-out. **Guards are component-level, not router `beforeLoad`** — deliberate, because the session lives in browser storage and `beforeLoad` would eject signed-in users on every SSR pass. Wrap protected pages in `<RequireAuth>` (redirects to `/login`); wrap `/login`, `/signup`, `/forgot-password` in `<RedirectIfAuthenticated`. `reset-password.tsx` is intentionally unguarded. When Supabase is unconfigured, `RequireAuth` renders the "setup needed" `SupabaseSetupNotice` instead of redirecting. **`user_id` always comes from the session** — never from a prop, param, or URL; every query is `.eq("user_id", userId)`.

**Server.** `src/server.ts` is a custom fetch entry (redirected to from `vite.config.ts`) that converts h3's stackless `{"unhandled":true,"message":"HTTPError"}` 500 bodies into the standalone `renderErrorPage()` HTML. It works together with `src/lib/error-capture.ts`, which monkey-patches `console.error` to stash the real `Error` in a 5-second-TTL slot and expands the cause chain — h3 swallows the original otherwise. `src/start.ts` must **re-install the CSRF handler itself**, because defining the file opts out of the automatic one. `public/sw.js` is served unbundled; its registration is memoised in `src/lib/service-worker.ts` and happens once in `__root.tsx`.

**Reminder push delivery.** `GET|POST /api/reminders/due` (`src/routes/api.reminders.due.ts`) is driven by an **external scheduler** (none configured in this repo — there is no cron config and no `vercel.json`). Flow: bearer check against `CRON_SECRET` → `503` if the secret is missing/malformed (it names the variable and never fakes a delivery), `401` if it mismatches → delivery pass. `src/lib/reminder-delivery.server.ts` reads secrets through a `serverEnv(name)` helper (`process.env` first, then a hand-parse of `.env.local` as a dev fallback) and owns the atomic claim via the `claim_due_reminder()` Postgres function; it releases the claim on failure and deletes dead push endpoints.

**Env split is strict.** Client/public values are read from `import.meta.env` and committed in `.env.production` (the file `vite build` loads). Server secrets — `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY`, optional `VAPID_SUBJECT` — go through `serverEnv()` and live only in the git-ignored `.env.local`. **Never give a secret a `VITE_` prefix**; that bundles it into public browser code.

**Migrations** (`supabase/migrations/`, applied by hand in the Supabase SQL editor — there is no migration runner in this repo):
- `0001_create_profiles.sql` — `profiles` keyed to `auth.users`, RLS, sign-up trigger.
- `0002_create_people_memories_reminders.sql` — `people`, `memories` (nullable `person_id`), `reminders`.
- `0003_create_push_subscriptions.sql` — `push_subscriptions`, unique on endpoint.
- `0004_reminder_push_delivery.sql` — `reminders.notified_at` + partial due index + atomic `claim_due_reminder()`.
- `0005_schedule_reminder_push_delivery.sql` — **an inert tombstone. Never run it.** The pg_cron + pg_net + Vault scheduler was abandoned; the file contains no executable statements.

## Commands

```sh
npm run dev        # vite dev
npm run build      # vite build (loads .env.production)
npm run build:dev  # vite build --mode development — use this when Supabase env vars are only in .env.local
npm run lint       # eslint .
npm run format     # prettier --write .
```

- There is **no test script and no test runner.** Verify changes with `npm run lint` + `npx tsc --noEmit` (or `npm run build`).
- Exercise the delivery endpoint locally: `curl -X POST http://localhost:3000/api/reminders/due -H "Authorization: Bearer $CRON_SECRET"`.
- After any schema change, re-run the relevant `supabase/migrations/*.sql` in the Supabase SQL editor — editing app code alone will not make it work.

## Gotchas

- **Never force-push, rebase, amend, or squash commits that are already pushed.** The project is connected to [Lovable](https://lovable.dev); pushes to the connected branch sync back into the Lovable editor, and rewriting published history makes the user lose project history. Keep the branch always in a working state.
- **The app runs but shows a "setup needed" notice until Supabase is configured.** That is intentional, not a bug. Fill `.env.local` from `.env.example` (copy `.env.example` → `.env.local`) and run `0001_create_profiles.sql` before expecting the signed-in screens.
- **Unresolved deployment question — do not assume.** The Nitro build output is a **Cloudflare Workers** target (`.output/server/wrangler.json`, `nodejs_compat`), but `0005`'s header text refers to Vercel + Vercel Cron and the README says "external scheduler". There is no `vercel.json` and no scheduler config in this repo. The bearer check is the endpoint's only protection, so the scheduler's `CRON_SECRET` must match the deployed value **exactly** or every run is rejected. Confirm the real hosting target with the user before changing deployment code.
- `0005_schedule_reminder_push_delivery.sql` is safe to delete if the tombstone confuses tooling, but leaving it is harmless — it is never applied.
- **Stale root artifacts not covered by `.gitignore`**: `findstr` (a stray empty file), `lint-output.txt`, and `.tscout.txt` would get committed. Do not add them, and do not `git add -A`. (`.verify-webpush.ts` *is* intentionally ignored but kept on disk so `node .verify-webpush.ts` can be re-run for the Web Push crypto check.)
- `env` values are **dual-read** on the server: `reminder-delivery.server.ts:166-170` reads `VITE_*` from both `process.env` and `import.meta.env` so the same code works in the Vite SSR server and in the built Nitro worker.
- The 60s clock tick in the store means a component that derives time-based state must not assume it only re-renders on data change.
