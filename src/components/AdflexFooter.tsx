import Image from "next/image";
import Link from "next/link";
import type {
  ContactDetails,
  ImageAsset,
  NavigationItem,
} from "@/content/adflex";
import styles from "./AdflexFooter.module.css";

type AdflexFooterProps = {
  logo: ImageAsset;
  navigation: readonly NavigationItem[];
  contact: ContactDetails;
  labels: { navTitle: string; designSystemLabel: string; legalNote: string };
  /** Anchor links only resolve on the home page, so other routes prefix them. */
  hrefPrefix?: string;
};

/**
 * Site footer on a white surface, so the supplied logo (which has an opaque
 * white background) is never placed on a dark colour.
 *
 * The `legal` row is an empty slot by design: funding programme, grant number,
 * funding disclaimer, EU emblem and legal pages can be added there later
 * without changing the layout.
 */
export function AdflexFooter({
  logo,
  navigation,
  contact,
  labels,
  hrefPrefix = "",
}: AdflexFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`adflex-container ${styles.inner}`}>
        <div className={styles.brand}>
          <Image
            className={styles.logo}
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            sizes="200px"
          />
          <p className={styles.email}>
            <a className="adflex-link" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          </p>
        </div>

        <nav className={styles.nav} aria-label="Footer">
          <h2 className={styles.navTitle}>{labels.navTitle}</h2>
          <ul className={styles.navList}>
            {navigation.map((item) => (
              <li key={item.id}>
                <a
                  className={styles.navLink}
                  href={`${hrefPrefix}${item.href}`}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <Link className={styles.navLink} href="/design-system">
                {labels.designSystemLabel}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className={`adflex-container ${styles.legal}`}>
        <p>© {year} ADFLEX</p>
        <p>{labels.legalNote}</p>
      </div>
    </footer>
  );
}
