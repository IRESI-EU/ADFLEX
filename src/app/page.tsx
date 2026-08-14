import type { Metadata } from "next";
import Link from "next/link";
import { adflexContent, resolveNavigation } from "@/content/adflex";
import { canonical } from "@/lib/site";
import { nextUpcomingEvent } from "@/content/published";
import { AdflexHeader } from "@/components/AdflexHeader";
import { AdflexHero } from "@/components/AdflexHero";
import { SectionShell } from "@/components/SectionShell";
import { TechnologyCard } from "@/components/TechnologyCard";
import { PartnerCard } from "@/components/PartnerCard";
import { PilotSection } from "@/components/PilotSection";
import { AdflexFooter } from "@/components/AdflexFooter";
import { EventAnnouncement } from "@/components/EventAnnouncement";
import styles from "./home.module.css";

export const metadata: Metadata = canonical("/");

/** Public ADFLEX home page. Durable project copy comes from adflex.ts. */
export default function HomePage() {
  const {
    brand,
    navigation,
    hero,
    about,
    technologies,
    consortium,
    pilot,
  } = adflexContent;

  const nav = resolveNavigation(navigation, { onHome: true });
  const upcomingEvent = nextUpcomingEvent();
  const aboutGlimpse = about.items.find((item) => item.id === about.home.itemId);

  return (
    <>
      <AdflexHeader logo={brand.logo} navigation={nav} />

      <main id="main-content">
        <AdflexHero id="home" content={hero} />

        <SectionShell
          id={about.home.itemId}
          eyebrow={about.eyebrow}
          title={about.home.heading}
          layout="split"
        >
          {aboutGlimpse ? (
            <p className={styles.aboutLead}>{aboutGlimpse.summary}</p>
          ) : null}
          <p className={styles.aboutActions}>
            <Link className="adflex-cta" href={about.cta.href}>
              {about.cta.label}
            </Link>
          </p>
        </SectionShell>

        <SectionShell
          id="technologies"
          eyebrow="What we are building"
          title={technologies.title}
          intro={technologies.intro}
          introFigure={technologies.introFigure}
          tone="band"
        >
          <div className={styles.cardGrid}>
            {technologies.items.map((technology, index) => (
              <TechnologyCard
                key={technology.id}
                technology={technology}
                index={index + 1}
                priority={index < 2}
              />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          id="consortium"
          eyebrow="Who is involved"
          title={consortium.title}
          intro={consortium.intro}
          tone="soft"
        >
          <div className={styles.partnerGrid}>
            {consortium.partners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        </SectionShell>

        <PilotSection id="pilot" content={pilot} />
      </main>

      <AdflexFooter logo={brand.logo} />
      {upcomingEvent ? <EventAnnouncement event={upcomingEvent} /> : null}
    </>
  );
}