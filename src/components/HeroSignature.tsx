import styles from "./HeroSignature.module.css";

/**
 * The hero illustration: the ADFLEX signature sculpture.
 *
 * The brand mark is a disc, a leaf with a light vein, an open blue-grey ring
 * and a gold bolt. This rebuilds that vocabulary at hero scale as one emblem,
 * rather than enlarging the logo file — and folds the project's subjects into
 * the forms themselves instead of scattering icons around them:
 *
 *   leaf, with a fine array texture   renewables and rooftop solar
 *   disc, with a skyline in its base  the community and its buildings
 *   bolt                              energy, flexibility, charging
 *   ring + node                       the Digital Spine coordinating it
 *   capsule on the ring               storage
 *
 * Every cue is a facet of a shape that was going to be there anyway, which is
 * what keeps it an emblem rather than a diagram. Nothing is labelled.
 *
 * Decorative: everything it stands for is already said in the headline, the
 * paragraph beside it and the supplied system diagram below, so it is
 * `aria-hidden` and contributes nothing to the accessibility tree.
 *
 * All motion sits behind `prefers-reduced-motion`. No client-side JavaScript.
 */

/** The leaf, tilted up-right as in the mark. Shared by the shape and its clip. */
const LEAF =
  "M 168 322 C 168 206, 244 116, 358 100 C 344 214, 280 306, 168 322 Z";

/** Centre of the open ring, offset from the disc exactly as the mark offsets it. */
const RING = { cx: 272, cy: 254, r: 176 };

/**
 * Where the two markers sit on the ring.
 *
 * These must land on the *drawn* part of the arc. The ring is dashed open from
 * 174° round to 300° — the upper left, where the leaf is, exactly as the mark
 * leaves it open. A marker placed in that gap has no ring under it and reads as
 * a stray object floating beside the emblem, which is what happened first time.
 */
const NODE_ANGLE = -30; // 330°, upper right
const CAPSULE_ANGLE = 62; // lower right

function onRing(angleDeg: number, radius = RING.r) {
  const a = (angleDeg * Math.PI) / 180;
  return {
    x: +(RING.cx + Math.cos(a) * radius).toFixed(2),
    y: +(RING.cy + Math.sin(a) * radius).toFixed(2),
  };
}

const NODE = onRing(NODE_ANGLE);
const CAPSULE = onRing(CAPSULE_ANGLE);

export function HeroSignature() {
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 540 500"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="hs-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--adflex-color-brand)" stopOpacity="0.17" />
          <stop offset="58%" stopColor="var(--adflex-color-brand)" stopOpacity="0.05" />
          <stop offset="100%" stopColor="var(--adflex-color-brand)" stopOpacity="0" />
        </radialGradient>

        {/* The disc carries most of the emblem's weight, so it gets the only
            real gradient — light at the top shoulder, deeper at the base. */}
        <linearGradient id="hs-disc" x1="0.25" y1="0" x2="0.75" y2="1">
          <stop offset="0%" stopColor="#0f9e8f" />
          <stop offset="55%" stopColor="var(--adflex-brand-green)" />
          <stop offset="100%" stopColor="#046b60" />
        </linearGradient>

        <linearGradient id="hs-leaf" x1="0.1" y1="1" x2="0.9" y2="0">
          <stop offset="0%" stopColor="#0a7d72" />
          <stop offset="100%" stopColor="#22a597" />
        </linearGradient>

        {/* Fades the ring out at both ends so it reads as an open sweep rather
            than a circle that has been cut. */}
        <linearGradient id="hs-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--adflex-brand-slate)" stopOpacity="0.15" />
          <stop offset="30%" stopColor="var(--adflex-brand-slate)" stopOpacity="0.9" />
          <stop offset="75%" stopColor="var(--adflex-brand-slate)" stopOpacity="0.75" />
          <stop offset="100%" stopColor="var(--adflex-brand-slate)" stopOpacity="0.12" />
        </linearGradient>

        <linearGradient id="hs-bolt" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#ffd23d" />
          <stop offset="100%" stopColor="var(--adflex-brand-yellow)" />
        </linearGradient>

        <clipPath id="hs-leaf-clip">
          <path d={LEAF} />
        </clipPath>

        {/* The skyline is carved out of the disc, so it is a clip on the disc
            rather than shapes laid over it — that keeps it a facet of the form
            instead of a picture sitting on top. */}
        <clipPath id="hs-disc-clip">
          <circle cx="238" cy="226" r="152" />
        </clipPath>
      </defs>

      {/* ---- Halo ---------------------------------------------------- */}
      <circle className={styles.halo} cx="262" cy="244" r="228" fill="url(#hs-halo)" />

      {/* ---- Open ring ----------------------------------------------- */}
      {/* Drawn behind the disc so the sculpture reads as sitting in front of
          its own orbit, the way the mark layers them. */}
      <g className={styles.ringGroup}>
        <circle
          className={styles.ring}
          cx={RING.cx}
          cy={RING.cy}
          r={RING.r}
          pathLength={100}
        />
      </g>

      {/* ---- Disc, with the community carved into its base ------------ */}
      <g className={styles.discGroup}>
        <circle cx="238" cy="226" r="152" fill="url(#hs-disc)" />
        <g clipPath="url(#hs-disc-clip)" className={styles.skyline}>
          {/* A quiet stepped edge low in the disc: the built environment as a
              facet of the community form, not as a row of little buildings. */}
          <path
            d="M 70 378 v -34 h 26 v -18 h 30 v 30 h 22 v -46 h 34 v 46 h 26 v -26 h 32 v 26
               h 24 v -38 h 30 v 38 h 28 v 22 h -282 z"
          />
        </g>
        {/* Inner shadow along the disc's lower edge, for a little depth. */}
        <circle
          className={styles.discShade}
          cx="238"
          cy="226"
          r="152"
          clipPath="url(#hs-disc-clip)"
        />
      </g>

      {/* ---- Leaf ----------------------------------------------------- */}
      <g className={styles.leafGroup}>
        {/* A fine gap separates leaf from disc, exactly as the mark does. */}
        <path className={styles.leafGap} d={LEAF} />
        <path className={styles.leaf} d={LEAF} />

        {/* Array texture: fine ribs across the blade, clipped to it. Reads as
            a panelled surface at a glance and as nothing at all up close. */}
        <g clipPath="url(#hs-leaf-clip)" className={styles.array}>
          {Array.from({ length: 11 }, (_, i) => {
            const t = 96 + i * 22;
            return <path key={i} d={`M ${t} 340 L ${t + 96} 92`} />;
          })}
        </g>

        {/* The vein sliver from the mark. */}
        <path
          className={styles.vein}
          d="M 190 306 C 226 250, 282 176, 348 112"
        />
      </g>

      {/* ---- Bolt ------------------------------------------------------ */}
      <g className={styles.boltGroup}>
        <path
          className={styles.bolt}
          d="M 258 246 L 190 356 L 232 356 L 212 448 L 296 322 L 250 322 Z"
        />
      </g>

      {/* ---- Coordination node on the ring ---------------------------- */}
      <g className={styles.node} transform={`translate(${NODE.x} ${NODE.y})`}>
        <circle className={styles.nodePulse} r="20" />
        <circle className={styles.nodePlate} r="15" />
        <circle className={styles.nodeRing} r="15" />
        <path className={styles.nodeMarks} d="M 0 -8 V -3.5 M 0 8 V 3.5 M -8 0 H -3.5 M 8 0 H 3.5" />
        <circle className={styles.nodeCore} r="4.6" />
      </g>

      {/* ---- Storage capsule on the ring ------------------------------- */}
      <g
        className={styles.capsule}
        transform={`translate(${CAPSULE.x} ${CAPSULE.y}) rotate(${CAPSULE_ANGLE + 90})`}
      >
        <rect className={styles.capsuleBody} x="-14" y="-24" width="28" height="48" rx="13" />
        <rect className={styles.capsuleTrack} x="-4.5" y="-14" width="9" height="28" rx="4.5" />
        <rect className={styles.capsuleLevel} x="-4.5" y="-2" width="9" height="16" rx="4.5" />
      </g>
    </svg>
  );
}
