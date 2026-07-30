"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ImageAsset, NavigationItem } from "@/content/adflex";
import { NavLink } from "./NavLink";
import styles from "./AdflexHeader.module.css";

type AdflexHeaderProps = {
  logo: ImageAsset;
  /**
   * Navigation items with hrefs already resolved for the current route — see
   * `resolveNavigation`. When empty the header shows no collapsible menu.
   */
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
  const pathname = usePathname();

  /**
   * Which link represents the page you are on.
   *
   * Only route items qualify. The in-page anchors (Technologies, Consortium,
   * Pilot) are all on the home page, so marking them by pathname would flag
   * four links at once — knowing which section is in view needs scroll
   * tracking, which is a different feature. "Home" is the exception: it is an
   * anchor, but it is also what `/` means.
   */
  const isCurrent = (item: NavigationItem) => {
    if (item.id === "home") return pathname === "/";
    if (item.kind !== "route") return false;
    return pathname === item.href;
  };

  const items: NavigationItem[] = [
    ...navigation,
    ...(trailingLink
      ? [
          {
            id: "trailing",
            label: trailingLink.label,
            kind: "route" as const,
            href: trailingLink.href,
          },
        ]
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
              className={`${styles.toggle} ${isOpen ? styles.toggleOpen : ""}`}
              aria-expanded={isOpen}
              aria-controls={MENU_ID}
              onClick={() => setIsOpen((open) => !open)}
            >
              {/* Drawn in CSS rather than pulled from an icon package — three
                  bars that fold into a cross. Decorative: the button's text
                  carries the meaning. */}
              <span className={styles.toggleIcon} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
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
            {items.map((item) => {
              const current = isCurrent(item);
              return (
                <li key={item.id}>
                  <NavLink
                    className={`${styles.navLink} ${current ? styles.navLinkCurrent : ""}`}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={current ? "page" : undefined}
                  >
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
