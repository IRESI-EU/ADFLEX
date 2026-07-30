/**
 * Sets the colour theme before the browser paints anything.
 *
 * This has to be a raw inline script rather than an effect or a `next/script`
 * strategy. Both of those run after the first paint, which means the page would
 * render light and then snap to dark — the flash is exactly what this exists to
 * prevent. Inlined into `<head>`, it executes during parse, so the very first
 * frame is already correct.
 *
 * It also adds `adflex-js` to the document element. The toggle is hidden until
 * that class appears, so a reader without JavaScript is never shown a control
 * that cannot do anything.
 *
 * Kept deliberately tiny and dependency-free: it is parsed and run on every
 * request before anything else, so it must not grow.
 */

export const THEME_STORAGE_KEY = "adflex-theme";
export const THEME_ATTRIBUTE = "data-adflex-theme";

const script = `
(function () {
  try {
    var el = document.documentElement;
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var dark = stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    el.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)}, dark ? "dark" : "light");
    el.classList.add("adflex-js");
  } catch (e) {
    /* Private mode can throw on localStorage. Fall back to the light theme,
       which is the default the stylesheet already assumes. */
    document.documentElement.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)}, "light");
  }
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
