import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

type NavLinkProps = {
  href: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /** Set to "page" on the link matching the current route. */
  "aria-current"?: "page";
  children: ReactNode;
};

/**
 * Small internal helper shared by the header and footer — not a UI-library
 * component.
 *
 * Same-page anchors stay a plain `<a>`, so the browser handles the jump and the
 * `scroll-behavior` / `prefers-reduced-motion` rules in globals.css still apply.
 * Anything else is a real route, so it uses `next/link` for client navigation
 * and prefetching.
 */
export function NavLink({
  href,
  className,
  onClick,
  "aria-current": ariaCurrent,
  children,
}: NavLinkProps) {
  if (href.startsWith("#")) {
    return (
      <a
        className={className}
        href={href}
        onClick={onClick}
        aria-current={ariaCurrent}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      className={className}
      href={href}
      onClick={onClick}
      aria-current={ariaCurrent}
    >
      {children}
    </Link>
  );
}
