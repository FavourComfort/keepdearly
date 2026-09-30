import { useEffect, useState } from "react";

/**
 * The KeepDearly opening sequence: mark → name → tagline → app.
 *
 * A quiet welcome, not a splash screen. It shows the brand for roughly a
 * second and a quarter, entirely in opacity and a whisper of scale, then gets
 * out of the way. There is no spinner, no progress bar, and no artificial wait:
 * the app renders underneath it from the very first paint, so this only ever
 * *covers* content that is already there and already usable.
 *
 * Two deliberate decisions:
 *
 *  - It is `pointer-events-none` and `aria-hidden`. It is a decorative flourish,
 *    so it never steals a click and never traps or moves keyboard focus. The
 *    real app sits underneath and stays reachable the whole time, which also
 *    means a failed or slow script can never leave someone locked out of a
 *    working page.
 *
 *  - The mark is the same KeepDearly symbol used everywhere else, loaded from
 *    the verified PWA icon (`/icons/icon-192.png`, the raster of the brand
 *    mark). Reusing the asset rather than re-drawing the SVG keeps a single
 *    source of truth for the identity, and leaves the one documented home for
 *    the brand's literal colors exactly where it is.
 *
 * The sequence mounts once in the root component, so it plays on app start
 * (including a refresh, a direct link, and a PWA standalone launch) and not
 * again on client-side navigation.
 */

/** The exact brand tagline, unchanged from the rest of the product. */
const TAGLINE = "the little things that actually matter";

/** The wordmark, lowercase, exactly as the app's own header sets it. */
const WORDMARK = "keepdearly";

/**
 * Stage timings in milliseconds: mark is already visible, then the name, then
 * the tagline, then the whole thing fades away. Deliberately short — a
 * returning user should feel this as a breath, not a wait.
 */
const SHOW_NAME_AFTER = 300;
const SHOW_TAGLINE_AFTER = 620;
const FADE_OUT_AFTER = 980;
const UNMOUNT_AFTER = 1260;

/** Reduced motion keeps the same sequence, just shorter and without movement. */
const REDUCED_MOTION_FACTOR = 0.45;

export function OpeningSequence() {
  // 0 = mark, 1 = + name, 2 = + tagline, 3 = fading out.
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timers: number[] = [];
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scale = (ms: number) => ms * (prefersReducedMotion ? REDUCED_MOTION_FACTOR : 1);

    timers.push(window.setTimeout(() => setStep(1), scale(SHOW_NAME_AFTER)));
    timers.push(window.setTimeout(() => setStep(2), scale(SHOW_TAGLINE_AFTER)));
    timers.push(window.setTimeout(() => setStep(3), scale(FADE_OUT_AFTER)));
    timers.push(window.setTimeout(() => setVisible(false), scale(UNMOUNT_AFTER)));

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-100 flex flex-col items-center justify-center bg-surface"
    >
      <div
        className={`flex flex-col items-center gap-3 transition-all duration-500 ease-out motion-reduce:transition-none ${
          step >= 3 ? "scale-95 opacity-0 motion-reduce:scale-100" : "scale-100 opacity-100"
        }`}
      >
        <img
          src="/icons/icon-192.png"
          alt=""
          width={72}
          height={72}
          className={`h-18 w-18 transition-all duration-700 ease-out motion-reduce:transition-none ${
            step >= 3 ? "opacity-0" : "opacity-100"
          }`}
          style={{ transitionDelay: step >= 3 ? "0ms" : "80ms" }}
        />

        <span
          className={`text-headline-md lowercase leading-none tracking-tight text-primary transition-all duration-500 ease-out motion-reduce:transition-none ${
            step >= 1 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          } motion-reduce:translate-y-0`}
        >
          {WORDMARK}
        </span>

        <span
          className={`max-w-[16rem] text-center text-body-sm leading-tight text-on-surface-variant transition-opacity duration-500 ease-out motion-reduce:transition-none ${
            step >= 2 ? "opacity-100" : "opacity-0"
          }`}
        >
          {TAGLINE}
        </span>
      </div>
    </div>
  );
}
