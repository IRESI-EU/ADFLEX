import styles from "./HeroTwin.module.css";

/**
 * The hero illustration: a real community building and its digital twin.
 *
 * The composition is the argument the project makes. On the left a physical
 * mixed-use building with its energy assets — rooftop solar, heat pump, battery,
 * EV charger and car, a smart meter, and a grid connection. On the right the
 * same building again as a translucent wireframe. Between them a Digital Spine
 * hub, sitting on the rays that project one into the other.
 *
 * The twin is not a second drawing. Its massing is the same `<use>` of the same
 * `<g>`, so the silhouettes cannot drift apart — which is the whole point of a
 * digital twin, and would be a lie if the two shapes were maintained separately.
 *
 * Two flows are distinguished the way the supplied system diagram does it:
 * dotted teal for data and control, warm gold for power. Nothing is labelled
 * inside the artwork; the heading and the supplied diagram below carry the
 * meaning, and this is decorative — `aria-hidden`, contributing nothing to the
 * accessibility tree.
 *
 * All motion is CSS and sits behind `prefers-reduced-motion`. Geometry is fixed,
 * so there is no client-side JavaScript here at all.
 */

/** Massing shared by the physical building and its twin. */
function BuildingMass() {
  return (
    <g>
      {/* Main block */}
      <rect x="112" y="176" width="176" height="196" rx="7" />
      {/* Set-back upper storey, so the silhouette is not a plain box. Kept to
          the left half: the roof's right half carries the solar array, and the
          two collided when this sat centred. */}
      <rect x="120" y="138" width="78" height="42" rx="6" />
      {/* Roof slab */}
      <rect x="102" y="168" width="196" height="13" rx="5" />
    </g>
  );
}

export function HeroTwin() {
  return (
    <svg
      className={styles.svg}
      /* Cropped close to the drawing's real bounds — content runs x 40→556,
         y 84→400 — so the illustration fills its column instead of sitting in
         its own margin, with just enough headroom that the twin's upper storey
         is not crowded against the frame. The wide ratio also keeps the hero
         short rather than tall. */
      viewBox="20 62 556 358"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <g id="adflex-mass">
          <BuildingMass />
        </g>

        {/* Ground haze under the whole scene. */}
        <radialGradient id="adflex-ground" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--adflex-illus-panel-deep)" stopOpacity="0.75" />
          <stop offset="100%" stopColor="var(--adflex-illus-panel-deep)" stopOpacity="0" />
        </radialGradient>

        {/* Bloom behind the spine hub. */}
        <radialGradient id="adflex-hub-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--adflex-color-brand)" stopOpacity="0.26" />
          <stop offset="60%" stopColor="var(--adflex-color-brand)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--adflex-color-brand)" stopOpacity="0" />
        </radialGradient>

        {/* Vertical falloff on the twin, so it reads as a projection fading
            upward rather than as a solid second building. */}
        <linearGradient id="adflex-twin-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--adflex-illus-twin)" stopOpacity="0.5" />
          <stop offset="55%" stopColor="var(--adflex-illus-twin)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--adflex-illus-twin)" stopOpacity="0.55" />
        </linearGradient>

        <linearGradient id="adflex-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--adflex-illus-panel)" />
          <stop offset="100%" stopColor="var(--adflex-illus-panel-deep)" />
        </linearGradient>

        {/*
          Confines the wireframe and the scan line to the twin's own massing.

          The shapes are repeated here rather than `<use href="#adflex-mass">`,
          because a clip path may only contain shapes, text and `<use>` of a
          shape — a `<use>` of a group is not valid clip content, and browsers
          resolve it to an empty clip, which silently discards everything inside
          rather than failing loudly. The transform matches the twin's exactly.
        */}
        <clipPath id="adflex-twin-clip">
          <rect
            x="112"
            y="176"
            width="176"
            height="196"
            rx="7"
            transform="translate(300 -30) scale(0.86)"
          />
          <rect
            x="150"
            y="140"
            width="100"
            height="40"
            rx="6"
            transform="translate(300 -30) scale(0.86)"
          />
          <rect
            x="102"
            y="168"
            width="196"
            height="13"
            rx="5"
            transform="translate(300 -30) scale(0.86)"
          />
        </clipPath>
      </defs>

      {/* ---------------------------------------------------------------- */}
      {/* Ground                                                            */}
      {/* ---------------------------------------------------------------- */}
      <ellipse cx="330" cy="404" rx="300" ry="46" fill="url(#adflex-ground)" />

      {/* ---------------------------------------------------------------- */}
      {/* Grid connection — a small pylon and an incoming line              */}
      {/* ---------------------------------------------------------------- */}
      <g className={styles.pylon}>
        <path d="M40 372 L52 236 M76 372 L64 236 M52 236 h12" />
        <path d="M44 300 h28 M47 268 h22" />
        {/* Crossarm */}
        <path d="M46 244 h24" />
      </g>
      {/* Supply into the building, drawn as energy rather than data. */}
      <path
        className={`${styles.energy} ${styles.energyFlowSlow}`}
        d="M64 250 C 100 250, 96 196, 128 190"
      />

      {/* ---------------------------------------------------------------- */}
      {/* Digital twin — behind and above, a projection of the same massing */}
      {/* ---------------------------------------------------------------- */}
      <g className={styles.twin} transform="translate(300 -30) scale(0.86)">
        <use href="#adflex-mass" className={styles.twinFill} />
        <use href="#adflex-mass" className={styles.twinStroke} />
      </g>

      {/* Wireframe storey lines, clipped to the massing so they never spill.
          These are what make the twin read as a model rather than as a pale
          copy of the building. */}
      <g clipPath="url(#adflex-twin-clip)" className={styles.twinWire}>
        <path d="M380 145 h190 M380 172 h190 M380 199 h190 M380 226 h190 M380 253 h190 M380 280 h190" />
        <path d="M412 80 v230 M440 80 v230 M468 80 v230 M496 80 v230 M524 80 v230" />
      </g>

      {/* Nodes at a few wire intersections, so the mesh reads as instrumented
          rather than as graph paper. */}
      <g className={styles.twinNodes} clipPath="url(#adflex-twin-clip)">
        <circle cx="440" cy="172" r="2.6" />
        <circle cx="496" cy="199" r="2.6" />
        <circle cx="412" cy="253" r="2.6" />
        <circle cx="524" cy="226" r="2.6" />
        <circle cx="468" cy="280" r="2.6" />
      </g>

      {/* The solar array echoed in wireframe on the twin's roof, at the same
          transform as its massing. Without it the twin was a plain grid box
          beside a detailed building; with it the two visibly become the same
          building in two states, which is the whole point of the image. */}
      <g className={styles.twinEcho} transform="translate(300 -30) scale(0.86)">
        <path d="M206 167 l13 -21 h34 l-13 21 z" />
        <path d="M247 167 l13 -21 h34 l-13 21 z" />
        <path d="M212 156.5 h34 M253 156.5 h34" />
      </g>

      {/* Scanning line. A soft band travelling down the twin — the one moment
          in the illustration that says "being computed". */}
      <g clipPath="url(#adflex-twin-clip)">
        <rect
          className={styles.scan}
          x="360"
          y="90"
          width="230"
          height="26"
          fill="var(--adflex-illus-twin)"
        />
      </g>

      {/* Twin footprint, so it is anchored rather than floating free. */}
      <ellipse
        className={styles.twinShadow}
        cx="465"
        cy="352"
        rx="86"
        ry="11"
      />

      {/* ---------------------------------------------------------------- */}
      {/* Projection rays: physical -> spine -> twin                        */}
      {/* ---------------------------------------------------------------- */}
      <g className={styles.rays}>
        <path className={styles.ray} d="M292 196 L392 128" />
        <path className={`${styles.ray} ${styles.rayB}`} d="M292 262 L392 214" />
        <path className={`${styles.ray} ${styles.rayC}`} d="M292 340 L392 300" />
      </g>

      {/* ---------------------------------------------------------------- */}
      {/* Physical building                                                 */}
      {/* ---------------------------------------------------------------- */}
      <g className={styles.building}>
        <use href="#adflex-mass" className={styles.buildingFill} />
        <use href="#adflex-mass" className={styles.buildingStroke} />

        {/* Roof slab given its own fill, over the shared massing. */}
        <rect
          x="102"
          y="168"
          width="196"
          height="13"
          rx="5"
          fill="url(#adflex-roof)"
          stroke="var(--adflex-illus-ink)"
          strokeWidth="1.6"
        />

        {/* Rooftop solar, on the roof's right half. Drawn as slight
            parallelograms so the roof reads as a plane rather than a line. */}
        <g className={styles.solar}>
          <path d="M206 167 l13 -21 h34 l-13 21 z" />
          <path d="M247 167 l13 -21 h34 l-13 21 z" />
        </g>
        <g className={styles.solarGrid}>
          <path d="M212 156.5 h34 M253 156.5 h34" />
        </g>

        {/* Windows. Two bands, with one lit warm to suggest occupancy. */}
        <g className={styles.window}>
          <rect x="130" y="200" width="30" height="24" rx="3" />
          <rect x="172" y="200" width="30" height="24" rx="3" />
          <rect x="214" y="200" width="30" height="24" rx="3" />
          <rect x="130" y="242" width="30" height="24" rx="3" />
          <rect x="214" y="242" width="30" height="24" rx="3" />
          <rect x="130" y="284" width="30" height="24" rx="3" />
          <rect x="172" y="284" width="30" height="24" rx="3" />
        </g>
        <rect
          className={styles.windowLit}
          x="172"
          y="242"
          width="30"
          height="24"
          rx="3"
        />
        {/* Set-back storey windows, now clear of the array. */}
        <g className={styles.window}>
          <rect x="132" y="148" width="24" height="20" rx="3" />
          <rect x="164" y="148" width="24" height="20" rx="3" />
        </g>

        {/* Entrance */}
        <path
          className={styles.door}
          d="M216 372 v-40 a12 12 0 0 1 24 0 v40 z"
        />

        {/* Smart meter on the flank, with its status dot. */}
        <g className={styles.meter}>
          <rect x="266" y="288" width="17" height="23" rx="3" />
          <path d="M269 296 h11 M269 301 h11" />
        </g>
        <circle className={styles.meterDot} cx="274.5" cy="306" r="2.1" />
      </g>

      {/* ---------------------------------------------------------------- */}
      {/* Energy assets, along the front                                    */}
      {/* ---------------------------------------------------------------- */}

      {/* Heat pump */}
      <g className={styles.asset} transform="translate(46 316)">
        <rect x="0" y="0" width="52" height="42" rx="6" />
        <circle className={styles.fan} cx="18" cy="21" r="11" />
        <path className={styles.fanBlades} d="M18 12 v18 M9 21 h18" />
        <path d="M38 12 h8 M38 18 h8 M38 24 h8" />
      </g>

      {/* Battery / storage. The charge bars fill from the bottom and the top one
          is left empty — at equal weight the unit read as a clipboard. */}
      <g className={styles.asset} transform="translate(300 316)">
        <rect x="0" y="0" width="40" height="42" rx="6" />
        <path className={styles.batteryTerminal} d="M14 -5 h12 a2 2 0 0 1 2 2 v3 h-16 v-3 a2 2 0 0 1 2 -2 z" />
        <g className={styles.batteryCells}>
          <rect x="8" y="28" width="24" height="7" rx="2.5" />
          <rect x="8" y="18" width="24" height="7" rx="2.5" />
        </g>
        <g className={styles.batteryCellEmpty}>
          <rect x="8" y="8" width="24" height="7" rx="2.5" />
        </g>
      </g>

      {/* EV charger and car */}
      <g className={styles.asset} transform="translate(126 392)">
        <rect x="0" y="-42" width="19" height="42" rx="5" />
        <rect className={styles.chargerScreen} x="4" y="-36" width="11" height="9" rx="2" />
        <path d="M19 -24 c 12 0, 10 12, 20 12" />
      </g>
      <g className={styles.car} transform="translate(150 392)">
        <path d="M6 0 C 2 0, 0 -4, 2 -9 L 10 -22 C 13 -27, 18 -29, 24 -29 h56 c6 0, 11 2, 15 6 l12 12 c4 2, 6 5, 6 9 c0 2, -2 4, -5 4 z" />
        <path className={styles.carGlass} d="M22 -22 h22 v13 h-32 z M50 -22 h26 l10 13 h-36 z" />
        <circle className={styles.wheel} cx="30" cy="0" r="8" />
        <circle className={styles.wheel} cx="88" cy="0" r="8" />
      </g>

      {/* Contact shadows, so nothing looks pasted on. */}
      <g className={styles.contactShadow}>
        <ellipse cx="72" cy="360" rx="30" ry="5" />
        <ellipse cx="320" cy="360" rx="24" ry="5" />
        <ellipse cx="205" cy="394" rx="66" ry="6" />
        <ellipse cx="200" cy="374" rx="104" ry="7" />
      </g>

      {/* ---------------------------------------------------------------- */}
      {/* Data flows: assets -> spine                                       */}
      {/* ---------------------------------------------------------------- */}
      <g className={styles.dataLines}>
        {/* heat pump */}
        <path className={styles.data} d="M96 328 C 170 300, 210 268, 316 244" />
        {/* battery */}
        <path className={`${styles.data} ${styles.dataB}`} d="M336 322 C 350 300, 344 268, 330 250" />
        {/* EV charger */}
        <path className={`${styles.data} ${styles.dataC}`} d="M170 366 C 240 350, 290 300, 318 256" />
        {/* smart meter */}
        <path className={`${styles.data} ${styles.dataD}`} d="M284 296 C 300 288, 310 272, 320 254" />
        {/* solar */}
        <path className={`${styles.data} ${styles.dataE}`} d="M276 148 C 300 168, 312 208, 320 234" />
      </g>

      {/* Energy flows: solar -> battery, battery -> car */}
      <path
        className={`${styles.energy} ${styles.energyFlow}`}
        d="M288 152 C 316 176, 322 268, 318 312"
      />
      <path
        className={`${styles.energy} ${styles.energyFlowB}`}
        d="M300 358 C 286 384, 268 392, 250 392"
      />

      {/* ---------------------------------------------------------------- */}
      {/* Digital Spine hub                                                 */}
      {/* ---------------------------------------------------------------- */}
      <g className={styles.hub}>
        <circle cx="330" cy="240" r="56" fill="url(#adflex-hub-glow)" />
        <circle className={styles.hubPulse} cx="330" cy="240" r="30" />
        <circle className={styles.hubRing} cx="330" cy="240" r="22" />
        <circle className={styles.hubCore} cx="330" cy="240" r="12" />
        {/* Three ticks, so the hub reads as a device rather than a dot. */}
        <path className={styles.hubTicks} d="M330 210 v-8 M356 255 l7 4 M304 255 l-7 4" />
      </g>

      {/* Free-floating data motes between the two halves. */}
      <g className={styles.motes}>
        <circle cx="368" cy="176" r="2.6" />
        <circle cx="404" cy="248" r="2" />
        <circle cx="356" cy="300" r="2.3" />
        <circle cx="424" cy="200" r="1.8" />
      </g>
    </svg>
  );
}
