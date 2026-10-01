// KeepDearly service worker.
//
// Two jobs, deliberately kept independent of each other:
//
// 1. Reminder push delivery (Phase 4B/4C). This worker is the receiving end of
//    reminder push: it renders the payload the server encrypted (see
//    src/lib/web-push.server.ts) and turns a notification click into
//    focus/open of the app.
//
//    The payload is JSON `{ title, body, url }`. Anything unparseable still
//    shows a usable notification — silently dropping a nudge the user expects
//    would be worse than showing plain text.
//
// 2. A minimal offline fallback (Phase 5F). The app is server-rendered, so
//    there is no static shell to precache and nothing here stores anything.
//    When a navigation cannot reach the network at all, the browser's own
//    error page is replaced with a small, branded, static page that explains
//    itself and offers a retry.
//
//    It is a *network-error* fallback only: it never intercepts a response the
//    server actually sent, never serves stale content, and never touches
//    non-navigation requests — so assets, API routes and Supabase all behave
//    exactly as they do online. It also deliberately does not cache HTML: this
//    app's pages are rendered per request and contain the signed-in user's own
//    content, so caching them would be wrong (and could leak one user's page to
//    another on a shared device). The page is built from a string inside the
//    worker, so it works even on a cold start with nothing cached at all.
//
// Security: this file must never contain secrets. The VAPID private key,
// Supabase service_role key, and all server secrets stay server-side.

self.addEventListener("push", (event) => {
  event.waitUntil(showNotificationFor(event.data));
});

/** Renders the server's payload, falling back to honest defaults. */
async function showNotificationFor(pushData) {
  const payload = parsePayload(pushData);
  await self.registration.showNotification(payload.title, {
    body: payload.body,
    data: { url: payload.url },
  });
}

function parsePayload(pushData) {
  const fallback = {
    title: "KeepDearly",
    body: "A reminder is waiting for you.",
    url: "/reminders",
  };

  const text = pushData ? pushData.text() : "";
  if (!text) return fallback;

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object") {
      return {
        title: typeof parsed.title === "string" && parsed.title ? parsed.title : fallback.title,
        body: typeof parsed.body === "string" ? parsed.body : fallback.body,
        url:
          typeof parsed.url === "string" && parsed.url.startsWith("/") ? parsed.url : fallback.url,
      };
    }
  } catch {
    // Not JSON — show the raw text rather than dropping the nudge.
  }
  return { ...fallback, body: text };
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data;
  const target = resolveTarget(data && data.url);
  event.waitUntil(openOrFocus(target));
});

/** Turns the payload's path into an absolute same-origin URL. */
function resolveTarget(path) {
  try {
    return new URL(path || "/reminders", self.location.origin).href;
  } catch {
    return self.location.origin;
  }
}

/** Focuses an open app window (navigating it) or opens a new one. */
async function openOrFocus(url) {
  const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const client of windows) {
    if ("focus" in client) {
      await client.focus();
      if ("navigate" in client) {
        await client.navigate(url).catch(() => {});
      }
      return;
    }
  }
  await self.clients.openWindow(url);
}

// ---------------------------------------------------------------------------
// Offline fallback (Phase 5F)
// ---------------------------------------------------------------------------

/**
 * Navigation requests only, and only when the network itself fails.
 *
 * Anything the server actually responded to — a 200, a 404, a 500 — is passed
 * straight through untouched. A deliberate 404 or 503 from our own API is a
 * real answer and must keep reaching the page as-is; only a thrown network
 * error (genuinely offline, DNS failure, dropped connection) is replaced.
 *
 * Non-navigation requests are left completely alone by returning early without
 * calling respondWith, so images, stylesheets, the API routes and Supabase all
 * keep their normal online behaviour and caching headers.
 */
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.mode !== "navigate") return;

  event.respondWith(
    fetch(request).catch(
      () =>
        new Response(OFFLINE_PAGE, {
          status: 503,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            // Never let a browser or intermediary store the offline notice.
            "Cache-Control": "no-store",
          },
        }),
    ),
  );
});

/**
 * The offline notice.
 *
 * Built as a string inside the worker rather than a separate file on purpose:
 * a file would have to be cached first, and this has to work on a cold start
 * when nothing at all is cached. Colours and the mark are the same brand values
 * as src/components/keepdearly/BrandMark.tsx and the app surface.
 */
const OFFLINE_PAGE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Offline — keepdearly</title>
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0; min-height: 100vh; min-height: 100dvh;
        display: grid; place-items: center; padding: 1.5rem;
        background: #FDF7F0; color: #0C244A;
        font: 15px/1.5 "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .card { max-width: 22rem; text-align: center; }
      .mark { width: 56px; height: 56px; margin: 0 auto 1.25rem; display: block; }
      h1 { font-size: 1.35rem; margin: 0 0 0.5rem; letter-spacing: -0.01em; }
      p { margin: 0 0 1.5rem; color: #6b6157; }
      button {
        font: inherit; font-weight: 600; cursor: pointer;
        padding: 0.6rem 1.4rem; border-radius: 999px; border: 0;
        background: #0C244A; color: #FDF7F0;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <svg class="mark" viewBox="0 0 120 120" fill="none" role="img" aria-label="KeepDearly">
        <path d="M20 28 H52 A32 32 0 0 1 52 92 H20 Z" fill="#0C244A" />
        <circle cx="74" cy="63" r="24" fill="#F59E82" />
        <circle cx="99" cy="30" r="11" fill="#B9A8D6" />
      </svg>
      <h1>You&rsquo;re offline</h1>
      <p>KeepDearly needs a connection to load. Your memories are safe &mdash; try again in a moment.</p>
      <button onclick="location.reload()">Try again</button>
    </div>
  </body>
</html>`;
