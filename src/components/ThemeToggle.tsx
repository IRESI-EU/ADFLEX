"use client";

import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "./ThemeScript";
import styles from "./ThemeToggle.module.css";

type ThemeToggleProps = {
  /** Accessible name for the control. */
  label: string;
  /** Word shown while the light theme is on, i.e. what pressing it gives you. */
  toDark: string;
  /** Word shown while the dark theme is on. */
  toLight: string;
};

/**
 * Switches between the light and dark themes.
 *
 * Deliberately holds no React state. The current theme already lives on the
 * document element, written before first paint by `ThemeScript`, so the button
 * reads it at click time and the two labels are shown and hidden by CSS off the
 * same attribute. That means there is nothing for the server and the client to
 * disagree about — no hydration mismatch, no flash of the wrong label, and no
 * effect that has to run before the control is correct.
 *
 * Both labels are always in the markup. Only one is visible, but the hidden one
 * is hidden with `display: none`, so it is not announced either.
 */
export function ThemeToggle({ label, toDark, toLight }: ThemeToggleProps) {
  const toggle = () => {
    const el = document.documentElement;
    const next = el.getAttribute(THEME_ATTRIBUTE) === "dark" ? "light" : "dark";
    el.setAttribute(THEME_ATTRIBUTE, next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* Private mode. The theme still applies for this page view; it just will
         not be remembered. Not worth telling the reader about. */
    }
  };

  return (
    <button type="button" className={styles.toggle} onClick={toggle} aria-label={label}>
      {/* Drawn inline rather than pulled from an icon package, matching the rest
          of the site. Decorative — the button's text carries the meaning. */}
      <span className={styles.icon} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" focusable="false">
          {/* Sun, shown while the light theme is on. */}
          <g className={styles.sun} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" />
          </g>
          {/* Crescent, shown while the dark theme is on. */}
          <path
            className={styles.moon}
            d="M20.1 14.6A8.4 8.4 0 0 1 9.4 3.9a8.4 8.4 0 1 0 10.7 10.7Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className={styles.text}>
        <span className={styles.whenLight}>{toDark}</span>
        <span className={styles.whenDark}>{toLight}</span>
      </span>
    </button>
  );
}
