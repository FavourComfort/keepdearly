# Dearly Remembered

Build KeepDearly, a small, warm, personal memory/reminder PWA.

The attached screenshots and the five public HTML files below are the visual source of truth for the UI. Read the HTML files and use the screenshots to faithfully reproduce the intended design, including layout, spacing, typography, colors, cards, buttons, icons, illustrations, responsive behavior, and overall visual feel.

DESIGN SOURCE — IMPORTANT

Use these five Stitch-generated HTML files as references:

https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1YzE4M2NmOTFiNmIwNDRmNGQwMWRlMDgwNTliEgoSBhDD5e3FBBgBkgEjCgpwcm9qZWN0X2lkEhVCEzg3NzUwODcxMzYxOTk3NTY3ODM&filename=&opi=89354086

https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1YzE4NDAyM2Y5ZTkwMjNiZmE0OWNmMGNjNzFiEgoSBhDD5e3FBBgBkgEjCgpwcm9qZWN0X2lkEhVCEzg3NzUwODcxMzYxOTk3NTY3ODM&filename=&opi=89354086

https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1YzE4M2ZjYjViODkwMjNiZmE0OWNmMGNjNzFiEgoSBhDD5e3FBBgBkgEjCgpwcm9qZWN0X2lkEhVCEzg3NzUwODcxMzYxOTk3NTY3ODM&filename=&opi=89354086

https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1YzE4M2ZhNjg4ZDMwMjNiYzIwNjMxMDIwMmYzEgoSBhDD5e3FBBgBkgEjCgpwcm9qZWN0X2lkEhVCEzg3NzUwODcxMzYxOTk3NTY3ODM&filename=&opi=89354086

https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1YzE4M2Y4MzAyMjQwMjNiZDQyNDY2MzNiZDFkEgoSBhDD5e3FBBgBkgEjCgpwcm9qZWN0X2lkEhVCEzg3NzUwODcxMzYxOTk3NTY3ODM&filename=&opi=89354086

If the HTML contains image references, you may hotlink those publicly available images where appropriate.

Do not simply embed these HTML files as static pages or use iframes.

The HTML is the design reference, not the final application architecture.

Recreate the design as proper React components inside the application so the UI can later become fully interactive.

PRODUCT SCOPE

For this first implementation, build ONLY the following four core screens:

Home

Capture Memory

Person Profile

Reminders

Do not create additional product areas.

Do NOT add:

authentication

Supabase

database

payments

subscriptions

admin

analytics

chat

social features

complex calendar

settings

onboarding

account management

notification management

backend services

Those will be considered separately later.

IMPORTANT: BUILD THE REAL APP

This must be a real responsive application, not a collection of static HTML pages.

Use reusable React components and proper application routing/navigation.

The UI should be structured so that real data can be connected later without rebuilding the interface.

For example, use reusable components such as:

MemoryCard

PersonCard

ReminderCard

PersonAvatar

PrimaryButton

MemoryInput

ReminderSelector

BottomNavigation

Do not duplicate large amounts of markup between screens.

RESPONSIVE DESIGN

KeepDearly is a responsive PWA.

The design must work properly on:

mobile phones

tablets

laptops

desktop screens

Mobile should be the primary design reference because the product is intended to feel personal and effortless.

However, do NOT create a phone-only application.

On desktop, keep the content comfortably centered and visually intimate.

Do not stretch the UI across the entire screen.

Do not turn the application into a large enterprise dashboard.

NAVIGATION

Implement working client-side navigation between the four screens.

The user should be able to move naturally between:

Home
→ Capture Memory
→ Person Profile
→ Reminders

The primary Save Memory action should open the Capture Memory screen.

Person cards should open the relevant Person Profile.

Reminder interactions should open the appropriate contextual view where appropriate.

The navigation should feel like one coherent application rather than four separate pages.

CORE PRODUCT BEHAVIOR FOR THIS PHASE

Although there is no backend yet, implement lightweight local/demo state where necessary so the UI can demonstrate the intended interactions.

Use realistic sample data.

For example:

Sarah

Birthday: October 4

Likes: Vanilla perfume, strawberry cheesecake

Gift idea: Vanilla perfume

Memory: “Sarah mentioned she wants to visit Zanzibar.”

Mum

Birthday: November 18

Gift idea: New handbag

The purpose of this phase is to make the application look and behave like the intended product, while keeping the architecture ready for a real backend later.

Do not build a full persistence/backend system yet.

HOME

Faithfully reproduce the Stitch Home design.

The Home screen should communicate the central KeepDearly idea:

Know something today that's worth remembering later?

Primary action:

Save a memory

Show meaningful upcoming reminders and people using the visual design from the Stitch reference.

Keep the page calm and uncluttered.

CAPTURE MEMORY

Faithfully reproduce the Stitch Capture Memory design.

The user should be able to enter something such as:

“Sarah mentioned she loves vanilla perfume…”

Then optionally associate it with:

an existing person

a new person

something else

nobody

The person is NOT mandatory.

The user should also be able to choose whether and when the memory should be remembered later.

Use the reminder options shown in the design.

Primary action:

Keep this

This interaction should feel extremely quick and effortless.

PERSON PROFILE

Faithfully reproduce the Stitch Person Profile design.

Display information such as:

birthday

likes

dislikes

gift ideas

memories

Use the visual language from Stitch so the page feels like a personal keepsake rather than a contact-management/CRM screen.

REMINDERS

Faithfully reproduce the Stitch Reminders design.

Display upcoming reminders in a simple, meaningful way.

Example:

Sarah's birthday
October 4

“You noted that she likes vanilla perfume.”

Do not create a complex calendar.

BRAND

Product name:

KeepDearly

Tagline:

 The little things that actually matter.

The brand should feel:

warm

thoughtful

elegant

calm

personal

modern

emotionally pleasant

It should NOT feel like:

a CRM

a productivity dashboard

a business application

a social network

a childish scrapbook

an overly romantic couples app

Preserve the visual identity established by the Stitch designs.

IMPLEMENTATION RULES

Treat the Stitch HTML and screenshots as the visual source of truth.

Recreate the UI as proper React components.

Do not iframe or embed the Stitch pages.

Do not replace the design with Lovable's generic default styling.

Do not redesign the product unnecessarily.

Do not invent additional screens.

Do not add backend infrastructure yet.

Do not add authentication yet.

Do not add payments or monetization yet.

Keep the code clean and reusable.

Keep the implementation simple.

Preserve the exact KeepDearly visual character from the supplied designs.

Make navigation functional.

Make the UI responsive.

Use realistic demo data so the screens feel alive.

VERY IMPORTANT — SCOPE CONTROL

This is the UI + application foundation phase only.

Do not move ahead into backend architecture, authentication, payments, notifications, subscriptions, or other features.

First make the four-screen KeepDearly experience visually faithful to the supplied Stitch designs and properly connected as a responsive application.

After implementation, provide a concise report containing:

what was created

which routes/screens were implemented

what was intentionally NOT implemented

any design elements from the Stitch HTML that could not be reproduced

any issues requiring attention

Stop after this phase.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/eb41deba-876b-412a-b9a5-d12b03f24864).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
