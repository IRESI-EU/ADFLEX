import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { adflexContent } from "@/content/adflex";
import { MotionScript } from "@/components/MotionScript";
import { RevealObserver } from "@/components/RevealObserver";
import "@/styles/adflex-tokens.css";
import "./globals.css";

/**
 * Both faces are self-hosted by next/font at build time — no external requests,
 * no CDN, no runtime dependency.
 *
 * Sora is a geometric display face that echoes the weight of the ADFLEX
 * wordmark; Inter carries the body copy, which is long-form in places.
 */
const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: adflexContent.meta.title,
  description: adflexContent.meta.description,
};


/**
 * The `.adflex-scope` wrapper carries every ADFLEX design token, so every route
 * is styled from one scoped source and nothing leaks to `:root`.
 * The skip link lives here so it is the first focusable element on every route.
 *
 * `suppressHydrationWarning` is on `<html>` because `MotionScript` adds the
 * `adflex-js` class to that element before React hydrates. The server cannot
 * know whether JavaScript will run, so that class legitimately differs between
 * the server markup and the DOM. It is scoped to this one element and does not
 * extend to any children.
 *
 * `data-scroll-behavior="smooth"` is **not decorative**. globals.css sets
 * `scroll-behavior: smooth` on `<html>` so anchor jumps animate, and without
 * this attribute Next cannot suspend that during a route change — so moving
 * from one page to another scrolled the whole document instead of jumping,
 * which reads as the new page sliding or lagging into place. The attribute is
 * how Next is told it may switch smooth scrolling off for the transition and
 * back on afterwards.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <MotionScript />
      </head>
      <body>
        <div className="adflex-scope">
          <a className="adflex-skip-link" href="#main-content">
            {adflexContent.meta.skipLinkLabel}
          </a>
          {children}
        </div>
        <RevealObserver />
      </body>
    </html>
  );
}
