/**
 * The KeepDearly mark.
 *
 * The abstract mark from the brand sheet: a deep-navy half-pill, a soft-blush
 * circle, and a small lavender dot — "people and the memories between them".
 *
 * This is a faithful vector reconstruction of the mark, built from the brand
 * sheet's own palette (sampled, not guessed):
 *
 *   Deep Navy   #0C244A  — primary
 *   Soft Blush  #F59E82  — accent circle
 *   Lavender    #B9A8D6  — the dot
 *   Cream       #FDF7F0  — app background
 *
 * It is drawn here rather than loaded as a bitmap for two reasons: the PWA
 * icons need it crisp at every size, and the opening sequence needs it inline
 * so it inherits the page's colours instead of shipping another asset.
 *
 * Geometry is expressed in a 120x120 box to match the viewBox the PWA icon
 * generator rasterises, so the SVG in the app and the PNGs on the Home Screen
 * are provably the same artwork.
 */

/** Sampled from the brand sheet. Do not substitute by eye. */
const NAVY = "#0C244A";
const BLUSH = "#F59E82";
const LAVENDER = "#B9A8D6";

/** The full icon tile, used by the PWA icon generator. */
export const BRAND_BACKGROUND = "#FDF7F0";

/** Deep Navy — the wordmark and primary brand colour. */
export const BRAND_NAVY = NAVY;

/**
 * The mark on its own, with a transparent background.
 *
 * Sized by the caller. `title` is only set when the mark is meaningful on its
 * own; everywhere else it should stay decorative and be hidden from assistive
 * technology instead.
 */
export function BrandMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {/* Navy half-pill: a straight left edge and straight top, closing in a
          wide semicircle on the right. */}
      <path d="M20 28 H52 A32 32 0 0 1 52 92 H20 Z" fill={NAVY} />
      {/* Blush circle, overlapping the pill slightly and sitting in front of it. */}
      <circle cx="74" cy="63" r="24" fill={BLUSH} />
      {/* The small lavender dot, resting on the circle's shoulder. */}
      <circle cx="99" cy="30" r="11" fill={LAVENDER} />
    </svg>
  );
}
