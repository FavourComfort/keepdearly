// KeepDearly service worker: Phase 4B delivery.
//
// This worker is the receiving end of reminder push: it renders the payload
// the server encrypted (see src/lib/web-push.server.ts) and turns a
// notification click into focus/open of the app.
//
// The payload is JSON `{ title, body, url }`. Anything unparseable still
// shows a usable notification — silently dropping a nudge the user expects
// would be worse than showing plain text.
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
          typeof parsed.url === "string" && parsed.url.startsWith("/")
            ? parsed.url
            : fallback.url,
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
