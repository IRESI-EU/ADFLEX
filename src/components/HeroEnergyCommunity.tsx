import styles from "./HeroEnergyCommunity.module.css";

/**
 * The hero illustration: a living energy community, coordinated by the Digital
 * Spine.
 *
 * A community building flanked by two homes on a soft platform, with the assets
 * the project actually names — rooftop solar, a heat pump, a battery, an EV and
 * its charger, a smart meter — and a grid connection at the back. A refined
 * integration hub floats over the centre; energy runs between the assets in
 * gold, data runs to and from the hub in dotted teal.
 *
 * ---------------------------------------------------------------------------
 * WHY THE GEOMETRY IS COMPUTED, NOT DRAWN
 * ---------------------------------------------------------------------------
 * Every solid here is projected from real (x, y, z) coordinates through one
 * `iso()` function, and every face comes from `boxFaces()` / `gableRoof()`.
 * Hand-authoring isometric path data means each shape carries its own idea of
 * where the horizon is, and they drift — which is exactly what makes an
 * illustration read as a pile of unrelated icons rather than as one scene.
 *
 * Because the projection is shared, objects also sort correctly: painter's
 * order is simply ascending `x + y`, since in this projection both axes run
 * toward the viewer.
 *
 * ---------------------------------------------------------------------------
 * ACCESSIBILITY
 * ---------------------------------------------------------------------------
 * Decorative. Everything it depicts is stated in the headline, the paragraph
 * beside it and the supplied system diagram below, so it is `aria-hidden` and
 * contributes nothing to the accessibility tree. Nothing is labelled inside the
 * artwork, and no text is baked into it.
 *
 * All motion is CSS and sits behind `prefers-reduced-motion`. There is no
 * client-side JavaScript in this component.
 */

/* --- Isometric projection ---------------------------------------------- */

/** cos 30°. A true 30° isometric rather than the flatter 2:1 game projection. */
const K = 0.8660254;

type P = { x: number; y: number };

/** World (x east, y south, z up) to screen. Both x and y run toward the viewer. */
function iso(x: number, y: number, z = 0): P {
  return { x: (x - y) * K, y: (x + y) * 0.5 - z };
}

const pts = (...p: P[]) => p.map((q) => `${q.x.toFixed(2)},${q.y.toFixed(2)}`).join(" ");

/**
 * The three visible faces of an axis-aligned box.
 *
 * `east` is the +x face and `south` the +y face; both point toward the viewer,
 * so both are drawn. The -x and -y faces never are.
 */
function boxFaces(x: number, y: number, w: number, d: number, h: number, z = 0) {
  const t = h + z;
  return {
    top: pts(iso(x, y, t), iso(x + w, y, t), iso(x + w, y + d, t), iso(x, y + d, t)),
    east: pts(iso(x + w, y, t), iso(x + w, y + d, t), iso(x + w, y + d, z), iso(x + w, y, z)),
    south: pts(iso(x, y + d, t), iso(x + w, y + d, t), iso(x + w, y + d, z), iso(x, y + d, z)),
  };
}

/** A gable roof whose ridge runs along x. Shows the +y slope and the +x end. */
function gableRoof(x: number, y: number, w: number, d: number, base: number, rise: number) {
  const mid = y + d / 2;
  const peak = base + rise;
  return {
    slope: pts(iso(x, y + d, base), iso(x + w, y + d, base), iso(x + w, mid, peak), iso(x, mid, peak)),
    gable: pts(iso(x + w, y, base), iso(x + w, mid, peak), iso(x + w, y + d, base)),
    ridge: pts(iso(x, mid, peak), iso(x + w, mid, peak)),
  };
}

/** A flat panel lying on a horizontal plane — solar cells, platform inlays. */
function panel(x: number, y: number, w: number, d: number, z: number) {
  return pts(iso(x, y, z), iso(x + w, y, z), iso(x + w, y + d, z), iso(x, y + d, z));
}

/* --- Scene layout ------------------------------------------------------- */
/* Footprints in world units. Depth order is ascending centre x+y; the comment
   on each is that value, so the render order below stays checkable. */

const CENTRAL = { x: 24, y: 24, w: 38, d: 34, h: 56 }; // 84
const HOME_B = { x: 60, y: -8, w: 26, d: 22, h: 24 }; //  76
const HOME_A = { x: 0, y: 62, w: 26, d: 22, h: 24 }; //   86
const BATTERY = { x: 64, y: 46, w: 12, d: 10, h: 14 }; // 121
const HEATPUMP = { x: 36, y: 60, w: 11, d: 9, h: 10 }; // 106
const CHARGER = { x: 16, y: 64, w: 4.5, d: 4.5, h: 15 }; // 87
const CAR = { x: 21, y: 74, w: 27, d: 12, h: 4.5 }; //    113
const PYLON = { x: 90, y: -16, h: 54 }; //                74

/**
 * Where the Digital Spine hub floats — clearly above the community building's
 * roof (z 46) without pushing the frame's top bound so high that the whole
 * scene has to shrink to accommodate one glow.
 */
const HUB = iso(43, 41, 74);

export function HeroEnergyCommunity() {
  const central = boxFaces(CENTRAL.x, CENTRAL.y, CENTRAL.w, CENTRAL.d, CENTRAL.h);
  const homeA = boxFaces(HOME_A.x, HOME_A.y, HOME_A.w, HOME_A.d, HOME_A.h);
  const homeB = boxFaces(HOME_B.x, HOME_B.y, HOME_B.w, HOME_B.d, HOME_B.h);
  const roofA = gableRoof(HOME_A.x, HOME_A.y, HOME_A.w, HOME_A.d, HOME_A.h, 9);
  const roofB = gableRoof(HOME_B.x, HOME_B.y, HOME_B.w, HOME_B.d, HOME_B.h, 9);
  const battery = boxFaces(BATTERY.x, BATTERY.y, BATTERY.w, BATTERY.d, BATTERY.h);
  const heat = boxFaces(HEATPUMP.x, HEATPUMP.y, HEATPUMP.w, HEATPUMP.d, HEATPUMP.h);
  const charger = boxFaces(CHARGER.x, CHARGER.y, CHARGER.w, CHARGER.d, CHARGER.h);
  /* Body low and long, cabin short and inset on both axes — at equal footprint
     the two boxes read as a stack of crates rather than as a vehicle. */
  const carBody = boxFaces(CAR.x, CAR.y, CAR.w, CAR.d, CAR.h, 2.2);
  const carCabin = boxFaces(CAR.x + 8, CAR.y + 2.2, 12, 7.6, 4.4, 6.7);

  /* Rooftop arrays. Six cells on the community building's flat roof, three on
     Home A's south slope — placed by the same projection as the roofs. */
  const centralPanels: string[] = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      centralPanels.push(
        panel(CENTRAL.x + 5 + c * 9.5, CENTRAL.y + 6 + r * 11, 8, 9, CENTRAL.h + 0.6),
      );
    }
  }

  /* Home A's panels sit on the sloped plane, so each corner is interpolated
     between eaves and ridge rather than laid flat. */
  const slopePanels: string[] = [];
  for (let c = 0; c < 3; c++) {
    const x0 = HOME_A.x + 3 + c * 7.2;
    const x1 = x0 + 6;
    const yEave = HOME_A.y + HOME_A.d - 2;
    const yRidge = HOME_A.y + HOME_A.d / 2 + 2;
    const zAt = (yy: number) => {
      const t = (HOME_A.y + HOME_A.d - yy) / (HOME_A.d / 2);
      return HOME_A.h + 9 * t;
    };
    slopePanels.push(
      pts(
        iso(x0, yEave, zAt(yEave) + 0.5),
        iso(x1, yEave, zAt(yEave) + 0.5),
        iso(x1, yRidge, zAt(yRidge) + 0.5),
        iso(x0, yRidge, zAt(yRidge) + 0.5),
      ),
    );
  }

  /* Anchors for the flow paths, so every line starts and ends on a real solid
     rather than at a guessed screen coordinate. */
  const aCentralRoof = iso(CENTRAL.x + 19, CENTRAL.y + 17, CENTRAL.h + 1);
  const aBattery = iso(BATTERY.x + 6, BATTERY.y + 5, BATTERY.h);
  const aCar = iso(CAR.x + 12, CAR.y + 6, 12);
  const aCharger = iso(CHARGER.x + 2, CHARGER.y + 2, CHARGER.h);
  const aHeat = iso(HEATPUMP.x + 5, HEATPUMP.y + 4, HEATPUMP.h);
  const aHomeA = iso(HOME_A.x + 13, HOME_A.y + 11, HOME_A.h + 9);
  const aHomeB = iso(HOME_B.x + 13, HOME_B.y + 11, HOME_B.h + 9);
  const aPylon = iso(PYLON.x, PYLON.y + 4, PYLON.h - 8);
  const aMeter = iso(CENTRAL.x + 34, CENTRAL.y + CENTRAL.d, 18);

  /** Quadratic curve between two projected points, bowed by `lift`. */
  const curve = (a: P, b: P, lift = 18) =>
    `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${((a.x + b.x) / 2).toFixed(1)} ${(
      (a.y + b.y) / 2 - lift
    ).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;

  /* The platform is a world-space rectangle, wider than it is deep, sized to
     hug the buildings. A square one left a third of the frame as empty ground
     in front of the community. */
  const PL = { x0: -10, y0: -16, x1: 94, y1: 80 };
  const platformTop = pts(
    iso(PL.x0, PL.y0),
    iso(PL.x1, PL.y0),
    iso(PL.x1, PL.y1),
    iso(PL.x0, PL.y1),
  );
  const platformEdge = pts(
    iso(PL.x1, PL.y0),
    iso(PL.x1, PL.y1),
    iso(PL.x0, PL.y1),
    iso(PL.x0, PL.y1, -5),
    iso(PL.x1, PL.y1, -5),
    iso(PL.x1, PL.y0, -5),
  );

  return (
    <svg
      className={styles.svg}
      /* 1.27:1 rather than the scene's natural 1.4. The hero row's height is set
         by the text column, which runs taller than a wide frame can fill; a
         squarer frame lets the community occupy that height instead of leaving
         a band of empty mint above and below it. */
      viewBox="0 0 660 520"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="ec-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--adflex-color-brand)" stopOpacity="0.16" />
          <stop offset="70%" stopColor="var(--adflex-color-brand)" stopOpacity="0.04" />
          <stop offset="100%" stopColor="var(--adflex-color-brand)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ec-hub-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--adflex-color-brand)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--adflex-color-brand)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ec-platform" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="var(--adflex-illus-panel)" />
          <stop offset="100%" stopColor="var(--adflex-illus-panel-deep)" />
        </linearGradient>
        {/* Faint technical dot field, confined to the platform. */}
        <pattern id="ec-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.4" cy="1.4" r="1.4" fill="var(--adflex-illus-ink)" fillOpacity="0.08" />
        </pattern>
      </defs>

      {/* Soft mint glow behind the whole community. */}
      <ellipse cx="330" cy="280" rx="300" ry="200" fill="url(#ec-glow)" />

      {/* Centred on the drawing's real projected bounds, including the hub's
          glow — screenX -78→97, screenY -50→89. Centring on the world origin
          instead left the scene high with dead ground beneath it, and centring
          without the glow clipped the hub against the top edge. */}
      <g transform="translate(296 191) scale(3.55)">
        {/* ---- Layer 1: platform ------------------------------------- */}
        <polygon className={styles.platformEdge} points={platformEdge} />
        <polygon className={styles.platformTop} points={platformTop} />
        <polygon className={styles.platformDots} points={platformTop} />

        {/* ---- Layer 6a: grid connection, furthest back (74) ---------
            One pylon read as two disconnected masts when both legs were drawn
            at equal weight with a faint crossarm between them. It is now a
            single silhouette: one tapering frame, two crossarms, and three
            insulators, with the conductors running off toward the community. */}
        <g className={styles.pylon}>
          {/* Tapering frame, in the y-plane through the pylon's centre */}
          <polyline
            points={pts(
              iso(PYLON.x - 5, PYLON.y + 4, 0),
              iso(PYLON.x - 1.8, PYLON.y + 4, PYLON.h),
              iso(PYLON.x + 1.8, PYLON.y + 4, PYLON.h),
              iso(PYLON.x + 5, PYLON.y + 4, 0),
            )}
          />
          {/* Lattice bracing */}
          {[0.22, 0.46, 0.7].map((t) => {
            const half = 5 - 3.2 * t;
            return (
              <polyline
                key={t}
                points={pts(
                  iso(PYLON.x - half, PYLON.y + 4, PYLON.h * t),
                  iso(PYLON.x + half, PYLON.y + 4, PYLON.h * t),
                )}
              />
            );
          })}
          {/* Two crossarms */}
          {[0.74, 0.92].map((t, i) => (
            <polyline
              key={t}
              points={pts(
                iso(PYLON.x - (10 - i * 3), PYLON.y + 4, PYLON.h * t),
                iso(PYLON.x + (10 - i * 3), PYLON.y + 4, PYLON.h * t),
              )}
            />
          ))}
          {/* Conductors leaving toward the community */}
          <path
            className={styles.conductor}
            d={`M${iso(PYLON.x - 10, PYLON.y + 4, PYLON.h * 0.74).x.toFixed(1)} ${iso(PYLON.x - 10, PYLON.y + 4, PYLON.h * 0.74).y.toFixed(1)}
                Q ${iso(PYLON.x - 26, PYLON.y + 4, PYLON.h * 0.6).x.toFixed(1)} ${iso(PYLON.x - 26, PYLON.y + 4, PYLON.h * 0.58).y.toFixed(1)}
                  ${iso(HOME_B.x + HOME_B.w, HOME_B.y + 6, HOME_B.h + 7).x.toFixed(1)} ${iso(HOME_B.x + HOME_B.w, HOME_B.y + 6, HOME_B.h + 7).y.toFixed(1)}`}
          />
        </g>

        {/* ---- Layer 6b: digital-twin outline, secondary -------------- */}
        {/* A quiet wireframe echo of the community building, lifted just above
            it. Deliberately faint: the twin is a detail here, not the subject. */}
        <g className={styles.twin}>
          <polygon points={boxFaces(CENTRAL.x, CENTRAL.y, CENTRAL.w, CENTRAL.d, CENTRAL.h, 7).top} />
          <polygon points={boxFaces(CENTRAL.x, CENTRAL.y, CENTRAL.w, CENTRAL.d, CENTRAL.h, 7).east} />
          <polygon points={boxFaces(CENTRAL.x, CENTRAL.y, CENTRAL.w, CENTRAL.d, CENTRAL.h, 7).south} />
        </g>

        {/* ---- Layer 2: buildings, in depth order --------------------- */}

        {/* Home B (76) */}
        <g className={styles.solid}>
          <polygon className={styles.faceEast} points={homeB.east} />
          <polygon className={styles.faceSouth} points={homeB.south} />
          <polygon className={styles.roofSlope} points={roofB.slope} />
          <polygon className={styles.roofGable} points={roofB.gable} />
          <polyline className={styles.ridge} points={roofB.ridge} />
          <polygon className={styles.win} points={panel(HOME_B.x + 5, HOME_B.y + HOME_B.d, 6, 0, 0)} />
        </g>
        <g className={styles.windows}>
          <polygon points={pts(iso(HOME_B.x + 5, HOME_B.y + HOME_B.d, 16), iso(HOME_B.x + 11, HOME_B.y + HOME_B.d, 16), iso(HOME_B.x + 11, HOME_B.y + HOME_B.d, 9), iso(HOME_B.x + 5, HOME_B.y + HOME_B.d, 9))} />
          <polygon points={pts(iso(HOME_B.x + 15, HOME_B.y + HOME_B.d, 16), iso(HOME_B.x + 21, HOME_B.y + HOME_B.d, 16), iso(HOME_B.x + 21, HOME_B.y + HOME_B.d, 9), iso(HOME_B.x + 15, HOME_B.y + HOME_B.d, 9))} />
        </g>

        {/* Community building (84) — the focal point */}
        <g className={styles.solid}>
          <polygon className={styles.faceEast} points={central.east} />
          <polygon className={styles.faceSouth} points={central.south} />
          <polygon className={styles.roofTop} points={central.top} />
          {/* Parapet, so the flat roof has an edge rather than a hard join */}
          <polyline
            className={styles.parapet}
            points={pts(
              iso(CENTRAL.x + CENTRAL.w, CENTRAL.y, CENTRAL.h + 2),
              iso(CENTRAL.x + CENTRAL.w, CENTRAL.y + CENTRAL.d, CENTRAL.h + 2),
              iso(CENTRAL.x, CENTRAL.y + CENTRAL.d, CENTRAL.h + 2),
            )}
          />
        </g>
        {/* Rooftop array */}
        <g className={styles.solar}>
          {centralPanels.map((p, i) => (
            <polygon key={i} points={p} />
          ))}
        </g>
        {/* Glazing — three storeys on the south face, three on the east, so the
            taller massing reads as a building with floors rather than as a
            stretched box. Storey bands are derived from one array, so adding a
            floor is a number here rather than another block of coordinates. */}
        <g className={styles.windows}>
          {[12, 26, 40].map((z) =>
            [0, 1, 2].map((i) => (
              <polygon
                key={`s${z}-${i}`}
                points={pts(
                  iso(CENTRAL.x + 5 + i * 11, CENTRAL.y + CENTRAL.d, z + 9),
                  iso(CENTRAL.x + 13 + i * 11, CENTRAL.y + CENTRAL.d, z + 9),
                  iso(CENTRAL.x + 13 + i * 11, CENTRAL.y + CENTRAL.d, z),
                  iso(CENTRAL.x + 5 + i * 11, CENTRAL.y + CENTRAL.d, z),
                )}
              />
            )),
          )}
          {[12, 26, 40].map((z) =>
            [0, 1].map((i) => (
              <polygon
                key={`e${z}-${i}`}
                points={pts(
                  iso(CENTRAL.x + CENTRAL.w, CENTRAL.y + 7 + i * 13, z + 9),
                  iso(CENTRAL.x + CENTRAL.w, CENTRAL.y + 16 + i * 13, z + 9),
                  iso(CENTRAL.x + CENTRAL.w, CENTRAL.y + 16 + i * 13, z),
                  iso(CENTRAL.x + CENTRAL.w, CENTRAL.y + 7 + i * 13, z),
                )}
              />
            )),
          )}
        </g>
        {/* One warm-lit window, so the building reads as occupied */}
        <polygon
          className={styles.winLit}
          points={pts(
            iso(CENTRAL.x + 16, CENTRAL.y + CENTRAL.d, 35),
            iso(CENTRAL.x + 24, CENTRAL.y + CENTRAL.d, 35),
            iso(CENTRAL.x + 24, CENTRAL.y + CENTRAL.d, 26),
            iso(CENTRAL.x + 16, CENTRAL.y + CENTRAL.d, 26),
          )}
        />
        {/* Smart meter on the south face, at head height beside the entrance */}
        <g className={styles.meter}>
          <polygon
            points={pts(
              iso(CENTRAL.x + 32, CENTRAL.y + CENTRAL.d, 9),
              iso(CENTRAL.x + 36, CENTRAL.y + CENTRAL.d, 9),
              iso(CENTRAL.x + 36, CENTRAL.y + CENTRAL.d, 3),
              iso(CENTRAL.x + 32, CENTRAL.y + CENTRAL.d, 3),
            )}
          />
        </g>

        {/* Home A (86) */}
        <g className={styles.solid}>
          <polygon className={styles.faceEast} points={homeA.east} />
          <polygon className={styles.faceSouth} points={homeA.south} />
          <polygon className={styles.roofSlope} points={roofA.slope} />
          <polygon className={styles.roofGable} points={roofA.gable} />
          <polyline className={styles.ridge} points={roofA.ridge} />
        </g>
        <g className={styles.solar}>
          {slopePanels.map((p, i) => (
            <polygon key={i} points={p} />
          ))}
        </g>
        <g className={styles.windows}>
          <polygon points={pts(iso(HOME_A.x + 4, HOME_A.y + HOME_A.d, 17), iso(HOME_A.x + 10, HOME_A.y + HOME_A.d, 17), iso(HOME_A.x + 10, HOME_A.y + HOME_A.d, 10), iso(HOME_A.x + 4, HOME_A.y + HOME_A.d, 10))} />
          <polygon points={pts(iso(HOME_A.x + 15, HOME_A.y + HOME_A.d, 17), iso(HOME_A.x + 21, HOME_A.y + HOME_A.d, 17), iso(HOME_A.x + 21, HOME_A.y + HOME_A.d, 10), iso(HOME_A.x + 15, HOME_A.y + HOME_A.d, 10))} />
        </g>

        {/* ---- Layer 3: energy assets -------------------------------- */}

        {/* EV charger (87) */}
        <g className={styles.solid}>
          <polygon className={styles.faceEast} points={charger.east} />
          <polygon className={styles.faceSouth} points={charger.south} />
          <polygon className={styles.assetTop} points={charger.top} />
        </g>
        <polygon
          className={styles.chargerScreen}
          points={pts(
            iso(CHARGER.x, CHARGER.y + CHARGER.d, 13),
            iso(CHARGER.x + 4.5, CHARGER.y + CHARGER.d, 13),
            iso(CHARGER.x + 4.5, CHARGER.y + CHARGER.d, 9.5),
            iso(CHARGER.x, CHARGER.y + CHARGER.d, 9.5),
          )}
        />

        {/* Heat pump (106) */}
        <g className={styles.solid}>
          <polygon className={styles.faceEast} points={heat.east} />
          <polygon className={styles.faceSouth} points={heat.south} />
          <polygon className={styles.assetTop} points={heat.top} />
        </g>
        <g className={styles.louvres}>
          {[3, 5.5, 8].map((z) => (
            <polyline
              key={z}
              points={pts(
                iso(HEATPUMP.x + 1.5, HEATPUMP.y + HEATPUMP.d, z),
                iso(HEATPUMP.x + 9.5, HEATPUMP.y + HEATPUMP.d, z),
              )}
            />
          ))}
        </g>

        {/* Car (114) */}
        <g className={styles.solid}>
          <polygon className={styles.faceEast} points={carBody.east} />
          <polygon className={styles.faceSouth} points={carBody.south} />
          <polygon className={styles.carTop} points={carBody.top} />
          <polygon className={styles.carGlassE} points={carCabin.east} />
          <polygon className={styles.carGlassS} points={carCabin.south} />
          <polygon className={styles.carTop} points={carCabin.top} />
        </g>
        <g className={styles.wheels}>
          {[4.5, 22].map((dx) => {
            const p = iso(CAR.x + dx, CAR.y + CAR.d, 2.2);
            return <ellipse key={dx} cx={p.x} cy={p.y} rx="3" ry="1.9" />;
          })}
        </g>
        {/* Charging lead from the post to the car, so the pair reads as one
            thing rather than as a box that happens to stand nearby. */}
        <path
          className={styles.lead}
          d={`M${iso(CHARGER.x + 2, CHARGER.y + 4.5, 8).x.toFixed(1)} ${iso(CHARGER.x + 2, CHARGER.y + 4.5, 8).y.toFixed(1)}
              Q ${iso(CHARGER.x + 4, CHARGER.y + 8, 4).x.toFixed(1)} ${iso(CHARGER.x + 4, CHARGER.y + 8, 3).y.toFixed(1)}
                ${iso(CAR.x + 1, CAR.y + 5, 4).x.toFixed(1)} ${iso(CAR.x + 1, CAR.y + 5, 4).y.toFixed(1)}`}
        />

        {/* Battery (121) */}
        <g className={styles.solid}>
          <polygon className={styles.faceEast} points={battery.east} />
          <polygon className={styles.faceSouth} points={battery.south} />
          <polygon className={styles.assetTop} points={battery.top} />
        </g>
        <g className={styles.charge}>
          <polygon points={pts(iso(BATTERY.x + 1.5, BATTERY.y + BATTERY.d, 4), iso(BATTERY.x + 10.5, BATTERY.y + BATTERY.d, 4), iso(BATTERY.x + 10.5, BATTERY.y + BATTERY.d, 2), iso(BATTERY.x + 1.5, BATTERY.y + BATTERY.d, 2))} />
          <polygon points={pts(iso(BATTERY.x + 1.5, BATTERY.y + BATTERY.d, 7.5), iso(BATTERY.x + 10.5, BATTERY.y + BATTERY.d, 7.5), iso(BATTERY.x + 10.5, BATTERY.y + BATTERY.d, 5.5), iso(BATTERY.x + 1.5, BATTERY.y + BATTERY.d, 5.5))} />
        </g>
        <polygon
          className={styles.chargeEmpty}
          points={pts(iso(BATTERY.x + 1.5, BATTERY.y + BATTERY.d, 11), iso(BATTERY.x + 10.5, BATTERY.y + BATTERY.d, 11), iso(BATTERY.x + 10.5, BATTERY.y + BATTERY.d, 9), iso(BATTERY.x + 1.5, BATTERY.y + BATTERY.d, 9))}
        />

        {/* ---- Layer 5: flows ---------------------------------------- */}
        {/*
          Energy: a solid gold line with a brighter pulse running along it.

          Each path is drawn twice. A single dashed path cannot be both — the
          dash pattern that makes one short pulse travel also erases the line
          it travels along, which is what happened first time: the routes were
          invisible and a lone gold speck drifted across empty ground.
        */}
        {(
          [
            [curve(aCentralRoof, aBattery, 14), ""],
            [curve(aBattery, aCar, 16), styles.energyB],
            [curve(aHomeA, aCentralRoof, 20), styles.energyC],
            [curve(aPylon, aHomeB, 12), styles.energyD],
          ] as const
        ).map(([d, mod], i) => (
          <g key={`e${i}`}>
            <path className={styles.energyBase} d={d} />
            <path className={`${styles.energy} ${mod}`} d={d} />
          </g>
        ))}

        {/* Data: dotted teal, every asset to the hub, and the hub to the grid. */}
        <g className={styles.dataGroup}>
          <path className={styles.data} d={curve(aHeat, HUB, 10)} />
          <path className={`${styles.data} ${styles.dataB}`} d={curve(aCharger, HUB, 14)} />
          <path className={`${styles.data} ${styles.dataC}`} d={curve(aBattery, HUB, 12)} />
          <path className={`${styles.data} ${styles.dataD}`} d={curve(aMeter, HUB, 8)} />
          <path className={`${styles.data} ${styles.dataE}`} d={curve(aHomeB, HUB, 10)} />
          <path className={`${styles.data} ${styles.dataF}`} d={curve(HUB, aPylon, 16)} />
        </g>

        {/* ---- Layer 4: the Digital Spine hub ------------------------ */}
        {/* A small faceted node with orbit rings — an integration point, not a
            server rack and not a cloud. Drawn last so it sits above the scene. */}
        <g className={styles.hub} transform={`translate(${HUB.x.toFixed(2)} ${HUB.y.toFixed(2)})`}>
          <circle className={styles.hubGlow} r="18" fill="url(#ec-hub-glow)" />
          <ellipse className={styles.hubOrbit} rx="17" ry="8" />
          <ellipse className={`${styles.hubOrbit} ${styles.hubOrbitB}`} rx="11.5" ry="5.5" />
          {/* Octahedron: two stacked pyramids, so the node reads as a solid. */}
          <polygon className={styles.hubUpper} points="0,-9 6.5,0 0,4.5 -6.5,0" />
          <polygon className={styles.hubLower} points="0,9 6.5,0 0,-4.5 -6.5,0" />
          <circle className={styles.hubPulse} r="13" />
        </g>
      </g>
    </svg>
  );
}
