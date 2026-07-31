import styles from "./HeroEnergyRibbon.module.css";

/**
 * The hero illustration: a minimal energy ribbon.
 *
 * A single continuous teal ribbon sweeps through the scene — rising past a home,
 * threading behind a modern community building, carrying the Digital Spine hub
 * at its crest, and settling at an abstract terminal node that stands for the
 * wider grid. Beneath it sit only the things the project actually coordinates:
 * rooftop solar, a battery, an EV and its charge point.
 *
 * The ribbon is the idea. Everything else is deliberately quiet, and the
 * connection between assets is carried by one elegant curve rather than by a
 * web of wires — this is a hero, not a connection map.
 *
 * ---------------------------------------------------------------------------
 * WHY THE RIBBON PASSES BEHIND THE BUILDING
 * ---------------------------------------------------------------------------
 * Drawn in front it reads as a line laid over a picture; drawn behind, it
 * disappears at one edge of the building and re-emerges at the other, which is
 * what makes it read as flowing *through* the scene. That occlusion is the
 * whole reason the composition holds together without any connector lines.
 *
 * ---------------------------------------------------------------------------
 * ACCESSIBILITY
 * ---------------------------------------------------------------------------
 * Decorative. Everything it depicts is already stated in the headline, the
 * paragraph beside it and the supplied system diagram below, so it is
 * `aria-hidden` and contributes nothing to the accessibility tree. No text is
 * baked into the artwork.
 *
 * All motion sits behind `prefers-reduced-motion`, and there is no client-side
 * JavaScript in this component.
 */

/**
 * The ribbon's centreline, shared by every stroke drawn along it — the band,
 * the highlight and the travelling pulse. One constant so they can never drift
 * apart, which is the usual way a layered stroke effect goes wrong.
 */
const RIBBON =
  "M 24 300 C 84 264, 132 204, 210 186 C 288 168, 350 156, 404 126 " +
  "C 466 92, 522 152, 560 198 C 582 224, 592 238, 600 248";

/** Where the hub sits — an on-curve point of RIBBON, so it cannot drift off it. */
const HUB = { x: 404, y: 126 };

/** The abstract terminal node standing in for the grid. */
const TERMINAL = { x: 600, y: 248 };

export function HeroEnergyRibbon() {
  return (
    <svg
      className={styles.svg}
      /* Cropped to the drawing's real bounds — content runs y 116→374 — so the
         composition is not sitting in a band of its own empty margin. The wide
         ratio is deliberate: a calm horizontal graphic with air around it is
         what keeps the hero spacious rather than competing with the heading. */
      viewBox="0 62 640 344"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* The soft mint circle behind the composition. */}
        <radialGradient id="er-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--adflex-color-brand)" stopOpacity="0.15" />
          <stop offset="62%" stopColor="var(--adflex-color-brand)" stopOpacity="0.045" />
          <stop offset="100%" stopColor="var(--adflex-color-brand)" stopOpacity="0" />
        </radialGradient>

        {/* Along-the-ribbon gradient: fuller in the middle, easing away at both
            ends so the band arrives and leaves rather than being cut off. */}
        <linearGradient id="er-ribbon" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--adflex-color-brand)" stopOpacity="0.12" />
          <stop offset="22%" stopColor="var(--adflex-color-brand)" stopOpacity="0.85" />
          <stop offset="58%" stopColor="var(--adflex-color-primary)" stopOpacity="1" />
          <stop offset="88%" stopColor="var(--adflex-color-brand)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--adflex-color-brand)" stopOpacity="0.25" />
        </linearGradient>

        <linearGradient id="er-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--adflex-illus-surface)" />
          <stop offset="100%" stopColor="var(--adflex-illus-panel)" />
        </linearGradient>
      </defs>

      {/* Soft mint glow, centred on the composition rather than the frame. */}
      <circle cx="330" cy="228" r="205" fill="url(#er-glow)" />

      {/* ---- Ribbon, behind everything ------------------------------- */}
      <g className={styles.ribbonGroup}>
        <path className={styles.ribbonBand} d={RIBBON} />
        <path className={styles.ribbonSheen} d={RIBBON} />
        <path className={styles.ribbonPulse} d={RIBBON} />
      </g>

      {/* ---- Ground: one hairline, no platform ----------------------- */}
      <line className={styles.ground} x1="34" y1="360" x2="606" y2="360" />

      {/* ---- Smaller home -------------------------------------------- */}
      <g className={styles.solid}>
        <path className={styles.shadow} d="M 66 364 h 96 a 4 4 0 0 1 0 8 h -96 a 4 4 0 0 1 0 -8 z" />
        <path className={styles.face} d="M 78 360 v -62 h 72 v 62 z" />
        {/* Pitched roof, kept as a simple triangle */}
        <path className={styles.roof} d="M 70 298 L 114 268 L 158 298 z" />
        <rect className={styles.window} x="90" y="312" width="20" height="18" rx="3" />
        <rect className={styles.window} x="118" y="312" width="20" height="18" rx="3" />
        <path className={styles.door} d="M 104 360 v -20 a 10 10 0 0 1 20 0 v 20 z" />
      </g>

      {/* ---- Community building — the built focal point --------------- */}
      <g className={styles.solid}>
        <path className={styles.shadow} d="M 208 364 h 138 a 4 4 0 0 1 0 8 h -138 a 4 4 0 0 1 0 -8 z" />
        {/* Main face */}
        <path className={styles.face} d="M 214 360 v -178 a 5 5 0 0 1 5 -5 h 116 a 5 5 0 0 1 5 5 v 178 z" />
        {/* One darker return on the right: all the depth this needs */}
        <path className={styles.faceSide} d="M 322 360 v -183 h 13 a 5 5 0 0 1 5 5 v 178 z" />
        {/* Roof slab */}
        <rect className={styles.roof} x="208" y="170" width="138" height="9" rx="4" />

        {/* Rooftop solar — three panels, clearly visible */}
        <g className={styles.solar}>
          <rect x="228" y="152" width="30" height="16" rx="2" />
          <rect x="262" y="152" width="30" height="16" rx="2" />
          <rect x="296" y="152" width="30" height="16" rx="2" />
        </g>

        {/* Glazing: a calm grid, one bay lit warm so it reads as occupied */}
        <g className={styles.windows}>
          {[198, 232, 266, 300].map((y) =>
            [230, 262, 294].map((x) => (
              <rect key={`${x}-${y}`} x={x} y={y} width="24" height="22" rx="3" />
            )),
          )}
        </g>
        <rect className={styles.windowLit} x="262" y="266" width="24" height="22" rx="3" />
        <path className={styles.door} d="M 266 360 v -24 a 12 12 0 0 1 24 0 v 24 z" />
      </g>

      {/* ---- Battery --------------------------------------------------
          A wall cabinet: one soft rounded body with a charge level read down
          its left edge. Stacked bars and a terminal nub made it read as a
          clipboard rather than as storage. */}
      <g className={styles.solid}>
        <path className={styles.shadow} d="M 366 364 h 52 a 4 4 0 0 1 0 8 h -52 a 4 4 0 0 1 0 -8 z" />
        <rect className={styles.face} x="370" y="304" width="44" height="56" rx="11" />
        <rect className={styles.chargeTrack} x="379" y="316" width="7" height="32" rx="3.5" />
        <rect className={styles.charge} x="379" y="329" width="7" height="19" rx="3.5" />
        <circle className={styles.statusDot} cx="404" cy="320" r="2.6" />
      </g>

      {/* ---- Charge point and EV -------------------------------------- */}
      <g className={styles.solid}>
        <path className={styles.shadow} d="M 428 364 h 26 a 4 4 0 0 1 0 8 h -26 a 4 4 0 0 1 0 -8 z" />
        {/* Rounded head over a slim column, so the post has a form rather than
            being a bare stick. */}
        <path
          className={styles.face}
          d="M 430 360 v -44 a 11 11 0 0 1 22 0 v 44 z"
        />
        <rect className={styles.screen} x="435" y="308" width="12" height="10" rx="3" />
        {/* Lead to the car, so the pair reads as one thing */}
        <path className={styles.lead} d="M 452 330 c 14 0, 10 14, 22 14" />
      </g>

      <g className={styles.solid}>
        <path className={styles.shadow} d="M 458 364 h 116 a 5 5 0 0 1 0 10 h -116 a 5 5 0 0 1 0 -10 z" />
        {/* One clean silhouette rather than a detailed vehicle */}
        <path
          className={styles.car}
          d="M 466 352 c -6 0, -10 -4, -10 -10 v -8 c 0 -6, 4 -10, 10 -11 l 14 -2 l 12 -14
             c 3 -4, 7 -6, 12 -6 h 30 c 5 0, 9 2, 12 6 l 12 15 l 12 3 c 6 1, 10 5, 10 11 v 6
             c 0 6, -4 10, -10 10 z"
        />
        <path className={styles.carGlass} d="M 496 320 h 18 v 14 h -30 z M 520 320 h 20 l 11 14 h -31 z" />
        <circle className={styles.wheel} cx="486" cy="352" r="9" />
        <circle className={styles.wheel} cx="548" cy="352" r="9" />
        <circle className={styles.hubcap} cx="486" cy="352" r="3.4" />
        <circle className={styles.hubcap} cx="548" cy="352" r="3.4" />
      </g>

      {/* ---- Terminal node: the grid, suggested not drawn -------------- */}
      <g className={styles.terminalNode}>
        <circle className={styles.terminalRing} cx={TERMINAL.x} cy={TERMINAL.y} r="13" />
        <circle className={styles.terminalCore} cx={TERMINAL.x} cy={TERMINAL.y} r="5" />
      </g>

      {/* ---- Digital Spine hub, on the ribbon's crest ------------------ */}
      <g className={styles.hub} transform={`translate(${HUB.x} ${HUB.y})`}>
        <circle className={styles.hubPulse} r="19" />
        <circle className={styles.hubPlate} r="15" />
        <circle className={styles.hubRing} r="15" />
        {/* Four short marks: a coordination point, not a server or a cloud */}
        <path className={styles.hubMarks} d="M 0 -8.5 V -4 M 0 8.5 V 4 M -8.5 0 H -4 M 8.5 0 H 4" />
        <circle className={styles.hubCore} r="5" />
      </g>
    </svg>
  );
}
