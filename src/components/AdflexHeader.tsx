"use client";

import { useState } from "react";
import Image from "next/image";
import type { ImageAsset, NavigationItem } from "@/content/adflex";
import styles from "./AdflexHeader.module.css";

type AdflexHeaderProps = {
  logo: ImageAsset;
  /** Section anchors. When empty the header shows no collapsible menu. */
  navigation: readonly NavigationItem[];
  /** Where the logo links to. Anchor on the home page, `/` elsewhere. */
  homeHref?: string;
  /** Optional extra link rendered at the end of the navigation. */
  trailingLink?: { label: string; href: string };
  /** Accessible name for the nav landmark. */
  navLabel?: string;
};

const MENU_ID = "adflex-primary-navigation";

/**
 * Sticky site header: official logo on a white surface, navigation on the
 * right. Below the breakpoint a full navigation collapses behind a real
 * button that reports its state with `aria-expanded`, closes on Escape and
 * closes after a link is chosen.
 */
export function AdflexHeader({
  logo,
  navigation,
  homeHref = "#home",
  trailingLink,
  navLabel = "Primary",
}: AdflexHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const items: NavigationItem[] = [
    ...navigation,
    ...(trailingLink
      ? [{ id: "trailing", label: trailingLink.label, href: trailingLink.href }]
      : []),
  ];

  // A single trailing link always fits, so it is never hidden behind a toggle.
  const isCollapsible = navigation.length > 0;

  return (
    <header className={styles.header}>
      <div className={`adflex-container ${styles.inner}`}>
        <a className={styles.logoLink} href={homeHref}>
          <Image
            className={styles.logo}
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            sizes="(max-width: 720px) 160px, 220px"
            priority
          />
        </a>

        <nav
          className={styles.nav}
          aria-label={navLabel}
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsOpen(false);
          }}
        >
          {isCollapsible ? (
            <button
              type="button"
              className={styles.toggle}
              aria-expanded={isOpen}
              aria-controls={MENU_ID}
              onClick={() => setIsOpen((open) => !open)}
            >
              {isOpen ? "Close" : "Menu"}
            </button>
          ) : null}

          <ul
            id={MENU_ID}
            className={[
              styles.navList,
              isCollapsible ? styles.navListCollapsible : "",
              isOpen ? styles.navListOpen : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {items.map((item) => (
              <li key={item.id}>
                <a
                  className={styles.navLink}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
