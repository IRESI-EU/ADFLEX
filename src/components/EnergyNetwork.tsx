import styles from "./EnergyNetwork.module.css";

/**
 * The hero's decorative energy network.
 *
 * A hub with six satellites, and pulses that travel outward along the links —
 * the same shape the project describes: the Digital Spine in the middle,
 * coordinating assets around it. Drawn inline rather than pulled from an
 * illustration package, matching how the rest of the site handles graphics.
 *
 * Entirely decorative. It carries no information the headline and the supplied
 * system diagram below do not already state in full, so it is `aria-hidden` and
 * contributes nothing to the accessibility tree. Nothing here should ever
 * become the only place something is said.
 *
 * All motion is CSS and sits behind `prefers-reduced-motion` — see the module.
 * Geometry is fixed rather than random so the layout is identical on every
 * render; there is no client-side JavaScript in this component at all.
 */

/** Hub at the centre of a 0 0 440 440 viewBox. */
const HUB = { x: 220, y: 220 };

/**
 * Six satellites on a circle. Angles are hand-picked rather than evenly spaced:
 * an even hexagon reads as a snowflake, and a slight irregularity reads as a
 * network. Radii vary a little for the same reason.
 */
const NODES = [
  { angle: -90, radius: 150, size: 13, delay: 0 },
  { angle: -28, radius: 168, size: 9, delay: 0.9 },
  { angle: 38, radius: 142, size: 11, delay: 1.8 },
  { angle: 96, radius: 172, size: 8, delay: 2.6 },
  { angle: 158, radius: 148, size: 12, delay: 3.4 },
  { angle: 218, radius: 165, size: 10, delay: 4.2 },
] as const;

function pointAt(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: +(HUB.x + Math.cos(rad) * radius).toFixed(2),
    y: +(HUB.y + Math.sin(rad) * radius).toFixed(2),
  };
}

export function EnergyNetwork() {
  const nodes = NODES.map((n) => ({ ...n, ...pointAt(n.angle, n.radius) }));

  return (
    <svg
      className={styles.svg}
      viewBox="0 0 440 440"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Soft bloom behind the hub, so the centre reads as the source. */}
        <radialGradient id="adflex-net-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--adflex-color-brand)" stopOpacity="0.20" />
          <stop offset="55%" stopColor="var(--adflex-color-brand)" stopOpacity="0.07" />
          <stop offset="100%" stopColor="var(--adflex-color-brand)" stopOpacity="0" />
        </radialGradient>

        {/* Ring gradient, brighter at the top so the whole figure has a light
            direction rather than sitting flat. */}
        <linearGradient id="adflex-net-ring" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--adflex-color-brand)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--adflex-color-brand)" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      <circle cx={HUB.x} cy={HUB.y} r="200" fill="url(#adflex-net-glow)" />

      {/* Two orbit rings. Purely structural — they give the satellites
          something to sit on so the arrangement does not look arbitrary. */}
      <circle
        className={styles.orbit}
        cx={HUB.x}
        cy={HUB.y}
        r="150"
        fill="none"
        stroke="url(#adflex-net-ring)"
        strokeWidth="1"
      />
      <circle
        className={`${styles.orbit} ${styles.orbitOuter}`}
        cx={HUB.x}
        cy={HUB.y}
        r="186"
        fill="none"
        stroke="url(#adflex-net-ring)"
        strokeWidth="1"
        strokeDasharray="2 10"
      />

      {/* Links, then the travelling pulses on top of them. */}
      {nodes.map((n, i) => (
        <line
          key={`link-${i}`}
          className={styles.link}
          x1={HUB.x}
          y1={HUB.y}
          x2={n.x}
          y2={n.y}
        />
      ))}

      {nodes.map((n, i) => (
        <line
          key={`pulse-${i}`}
          className={styles.pulse}
          x1={HUB.x}
          y1={HUB.y}
          x2={n.x}
          y2={n.y}
          style={{ animationDelay: `${n.delay}s` }}
        />
      ))}

      {nodes.map((n, i) => (
        <g key={`node-${i}`} className={styles.node} style={{ animationDelay: `${n.delay * 0.4}s` }}>
          <circle className={styles.nodeHalo} cx={n.x} cy={n.y} r={n.size + 7} />
          <circle className={styles.nodeCore} cx={n.x} cy={n.y} r={n.size} />
        </g>
      ))}

      {/* The hub. Drawn last so it sits above every link. */}
      <circle className={styles.hubHalo} cx={HUB.x} cy={HUB.y} r="42" />
      <circle className={styles.hubRing} cx={HUB.x} cy={HUB.y} r="30" />
      <circle className={styles.hubCore} cx={HUB.x} cy={HUB.y} r="19" />
    </svg>
  );
}
