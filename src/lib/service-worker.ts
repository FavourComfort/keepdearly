/**
 * Service-worker registration: the Phase 4A foundation.
 *
 * Registered exactly once for the whole app, from the root route, so no screen
 * can accidentally register a second worker and no second app shell is needed.
 *
 * The worker itself (`public/sw.js`) renders incoming reminder pushes and
 * focuses/opens the app on notification click (Phase 4B delivery). This module
 * only registers and looks it up — it never sends or decrypts anything, and
 * nothing here touches the reminder engine.
 *
 * Every entry point is a no-op outside the browser, so server rendering and
 * unsupported browsers both pass through without throwing.
 */

/** Where the worker lives. Served as-is from `public/`, never bundled. */
export const SERVICE_WORKER_PATH = "/sw.js";

/** True only in a browser that actually supports service workers. */
export function serviceWorkersSupported(): boolean {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

/**
 * One promise for the process lifetime.
 *
 * Memoising the registration is what makes "registered once" true rather than
 * merely likely: however many callers ask, the browser is told once. A failure
 * is cached too, so a broken registration is not retried in a loop.
 */
let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

/** Registers the worker once, or resolves null where that is impossible. */
export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!serviceWorkersSupported()) return Promise.resolve(null);

  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker
      .register(SERVICE_WORKER_PATH, { scope: "/" })
      .catch((error: unknown) => {
        // A worker that will not register is not fatal: the app keeps working,
        // it simply cannot receive notifications. Reported, never thrown.
        console.error("Could not register the service worker:", error);
        return null;
      });
  }

  return registrationPromise;
}

/**
 * The registration already known to the browser, if any.
 *
 * Used when a device subscribed in an earlier visit: the subscription still
 * exists, so it can be re-checked without registering anything new.
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!serviceWorkersSupported()) return null;

  try {
    const existing = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_PATH);
    return existing ?? null;
  } catch (error) {
    console.error("Could not read the service worker registration:", error);
    return null;
  }
}

/**
 * A registration with an active worker, registering first when necessary.
 *
 * `pushManager.subscribe()` needs an active worker, so this waits for the one
 * already installing if the first call happens during page load.
 */
export async function readyServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  let registration = await registerServiceWorker();
  if (!registration) registration = await getServiceWorkerRegistration();
  if (!registration) return null;

  if (registration.active) return registration;

  const pending = registration.installing ?? registration.waiting;
  if (!pending) return registration;

  await new Promise<void>((resolve) => {
    const settle = () => {
      pending.removeEventListener("statechange", onChange);
      resolve();
    };
    const onChange = () => {
      if (pending.state !== "installing" && pending.state !== "installed") settle();
    };
    pending.addEventListener("statechange", onChange);
    // A worker stuck installing must not hold the caller hostage.
    setTimeout(settle, 10_000);
  });

  return registration;
}
