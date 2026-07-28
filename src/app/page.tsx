import { adflexContent } from "@/content/adflex";
import { AdflexHeader } from "@/components/AdflexHeader";
import { AdflexHero } from "@/components/AdflexHero";
import { SectionShell } from "@/components/SectionShell";
import { TechnologyCard } from "@/components/TechnologyCard";
import { PartnerCard } from "@/components/PartnerCard";
import { PilotSection } from "@/components/PilotSection";
import { EmptyState } from "@/components/EmptyState";
import { ContactBlock } from "@/components/ContactBlock";
import { AdflexFooter } from "@/components/AdflexFooter";
import styles from "./home.module.css";

/**
 * The ADFLEX public website: one scrolling page.
 *
 * Section order matches the navigation order defined in
 * `src/content/adflex.ts`. All copy comes from that file.
 */
export default function HomePage() {
  const {
    brand,
    navigation,
    hero,
    about,
    technologies,
    consortium,
    pilot,
    results,
    contact,
    footer,
  } = adflexContent;

  return (
    <>
      <AdflexHeader logo={brand.logo} navigation={navigation} />

      <main id="main-content">
        <AdflexHero id="home" content={hero} />

        <SectionShell id="about" title={about.title}>
          <div className={styles.aboutGrid}>
            {about.items.map((item) => (
              <article key={item.id} className={styles.aboutCard}>
                <h3>{item.title}</h3>
                <p className={styles.aboutBody}>{item.body}</p>
              </article>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="technologies"
          title={technologies.title}
          intro={technologies.intro}
          tone="soft"
        >
          <div className={styles.cardGrid}>
            {technologies.items.map((technology, index) => (
              <TechnologyCard
                key={technology.id}
                technology={technology}
                index={index + 1}
              />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="consortium"
          title={consortium.title}
          intro={consortium.intro}
        >
          <div className={styles.partnerGrid}>
            {consortium.partners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        </SectionShell>

        <PilotSection id="pilot" content={pilot} />

        <SectionShell id="results" title={results.title}>
          <EmptyState heading={results.heading} body={results.body} />
        </SectionShell>

        <SectionShell id="contact" title={contact.title} tone="soft">
          <ContactBlock contact={contact} />
        </SectionShell>
      </main>

      <AdflexFooter
        logo={brand.logo}
        navigation={navigation}
        contact={contact}
        labels={footer}
      />
    </>
  );
}
