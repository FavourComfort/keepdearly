import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { BRAND_NAVY, BrandMark } from "./BrandMark";

/**
 * The KeepDearly opening sequence and page loader.
 *
 * It has two jobs that share one look:
 *
 *  1. On app open — the mark appears on its own, then settles into the
 *     wordmark lockup, then gets out of the way. About 1.2 seconds, so a
 *     returning user feels a breath rather than a wait.
 *
 *  2. While a page is loading — that same lockup, held quietly, so a slow
 *     navigation reads as "keepdearly is thinking" rather than a blank screen
 *     or a browser spinner.
 *
 * A quiet welcome, not a splash screen: opacity and a whisper of scale, no
 * spinner, no progress bar, and never an artificial wait.
 *
 * It is `pointer-events-none` and `aria-hidden`, so it never steals a click and
 * never traps or moves keyboard focus. The real app sits underneath and stays
 * reachable throughout, which also means a slow or failed script can never lock
 * anyone out of a working page.
 *
 * The mark is the same `BrandMark` the PWA icons are generated from, so the
 * icon on the Home Screen and the one on screen are the same artwork.
 */

/** The wordmark, lowercase, exactly as the brand sets it. */
const WORDMARK = "keepdearly";

/** The tagline, in the brand sheet's uppercase letterspaced setting. */
const TAGLINE = "THE LITTLE THINGS THAT ACTUALLY MATTER";

/** Open-sequence timings in milliseconds. Deliberately short. */
const SHOW_LOCKUP_AFTER = 380;
const FADE_OUT_AFTER = 980;
const UNMOUNT_AFTER = 1260;

/** Reduced motion keeps the same sequence, just shorter and without movement. */
const REDUCED_MOTION_FACTOR = 0.45;

/**
 * How long a navigation must stay pending before the lockup appears. Without
 * this, every fast route change would flash the loader and read as jank.
 */
const LOADER_DELAY_MS = 220;

/** The wordmark lockup, shared by the open sequence and the page loader. */
function Lockup({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 ${className ?? ""}`}>
      <span
        className="text-headline-md leading-none tracking-tight"
        style={{ color: BRAND_NAVY, fontFamily: "var(--font-sans)", fontWeight: 700 }}
      >
        {WORDMARK}
      </span>
      <span className="text-label-sm uppercase tracking-[0.18em] text-on-surface-variant">
        {TAGLINE}
      </span>
    </div>
  );
}

export function OpeningSequence() {
  // Route transitions only. The first page load is handled by the open
  // sequence below, and authentication stays entirely with RequireAuth.
  const routeLoading = useRouterState({ select: (state) => state.isLoading });

  // 0 = mark on its own, 1 = + lockup, 2 = fading out.
  const [step, setStep] = useState(0);
  const [opening, setOpening] = useState(true);
  const [loaderVisible, setLoaderVisible] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scale = (ms: number) => ms * (prefersReducedMotion ? REDUCED_MOTION_FACTOR : 1);

    timers.push(window.setTimeout(() => setStep(1), scale(SHOW_LOCKUP_AFTER)));
    timers.push(window.setTimeout(() => setStep(2), scale(FADE_OUT_AFTER)));
    timers.push(window.setTimeout(() => setOpening(false), scale(UNMOUNT_AFTER)));

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);

  // The page loader. Debounced so a quick navigation never flashes it, and
  // gated on the open sequence finishing so the two never overlap.
  useEffect(() => {
    if (opening || !routeLoading) {
      setLoaderVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setLoaderVisible(true), LOADER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [routeLoading, opening]);

  if (!opening && !loaderVisible) return null;

  if (!opening) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-100 flex items-center justify-center bg-surface"
      >
        <div className="animate-in fade-in duration-300 motion-reduce:animate-none">
          <Lockup />
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-100 flex flex-col items-center justify-center bg-surface"
    >
      <div
        className={`flex flex-col items-center gap-3 transition-all duration-500 ease-out motion-reduce:transition-none ${
          step >= 2 ? "scale-95 opacity-0 motion-reduce:scale-100" : "scale-100 opacity-100"
        }`}
      >
        <BrandMark
          className={`h-18 w-18 transition-all duration-700 ease-out motion-reduce:transition-none ${
            step >= 1 ? "scale-90 opacity-0" : "scale-100 opacity-100"
          }`}
        />

        <div
          className={`transition-all duration-500 ease-out motion-reduce:transition-none ${
            step >= 1 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          } motion-reduce:translate-y-0`}
        >
          <Lockup />
        </div>
      </div>
    </div>
  );
}
