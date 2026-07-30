import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { adflexContent } from "@/content/adflex";
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
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body>
        <div className="adflex-scope">
          <a className="adflex-skip-link" href="#main-content">
            {adflexContent.meta.skipLinkLabel}
          </a>
          {children}
        </div>
      </body>
    </html>
  );
}
