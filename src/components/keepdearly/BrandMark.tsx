import iconUrl from "../../routes/design/icon.png";

/**
 * The KeepDearly mark.
 *
 * Uses src/routes/design/icon.png exactly as-is (no redraw, no recolor,
 * no crop). Sized by the caller via className.
 */

/** Sampled from the brand sheet. Do not substitute by eye. */
const NAVY = "#0C244A";

/** The full icon tile, used by the PWA icon generator. */
export const BRAND_BACKGROUND = "#FDF7F0";

/** Deep Navy — the wordmark and primary brand colour. */
export const BRAND_NAVY = NAVY;

/**
 * The mark on its own.
 *
 * Renders src/routes/design/icon.png exactly as-is via an <img>.
 * Sized by the caller. `title` becomes alt text when meaningful; otherwise
 * the image stays decorative and hidden from assistive technology.
 */
export function BrandMark({ className, title }: { className?: string; title?: string }) {
  return (
    <img
      src={iconUrl}
      className={className}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      draggable={false}
    />
  );
}
