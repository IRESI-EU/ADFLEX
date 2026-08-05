import { adflexContent, resolveNavigation } from "@/content/adflex";
import { AdflexHeader } from "./AdflexHeader";
import { PageHero } from "./PageHero";
import styles from "./RouteLoading.module.css";

/**
 * The shell shown while a database-backed route is being rendered.
 *
 * `/outputs` and `/news` stopped being prerendered when their content moved
 * into Postgres, so a click on either now waits for a server round trip. With
 * no `loading.tsx` the browser sits on the old page for that whole time and the
 * site reads as unresponsive — the click appears to have done nothing.
 *
 * The header and the page hero are rendered for real, because they are known
 * before any query runs. Only the part that depends on the database is a
 * placeholder, so the page does not visibly jump when the content arrives.
 */
export function RouteLoading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  const nav = resolveNavigation(adflexContent.navigation, { onHome: false });

  return (
    <>
      <AdflexHeader logo={adflexContent.brand.logo} navigation={nav} homeHref="/" />
      <main id="main-content">
        <PageHero eyebrow={eyebrow} title={title} />
        <div className={styles.body}>
          <div className="adflex-container">
            {/* Announced politely rather than assertively: it is a progress
                note, and it must not interrupt whatever a screen reader is
                already saying about the page it just left. */}
            <p className={styles.status} role="status">
              Loading…
            </p>
            <div className={styles.skeleton} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
