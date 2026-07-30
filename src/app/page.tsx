import Link from "next/link";
import { adflexContent, resolveNavigation } from "@/content/adflex";
import { AdflexHeader } from "@/components/AdflexHeader";
import { AdflexHero } from "@/components/AdflexHero";
import { SectionShell } from "@/components/SectionShell";
import { TechnologyCard } from "@/components/TechnologyCard";
import { PartnerCard } from "@/components/PartnerCard";
import { PilotSection } from "@/components/PilotSection";
import { AdflexFooter } from "@/components/AdflexFooter";
import styles from "./home.module.css";

/**
 * The ADFLEX public website: one scrolling page of sections. Project Outputs
 * and Contact each live on their own route â€” see `src/app/outputs` and
 * `src/app/contact`.
 *
 * Section order matches the navigation order defined in
 * `src/content/adflex.ts`. All copy comes from that file.
 */
export default function HomePage() {
  const { brand, navigation, hero, about, technologies, consortium, pilot } =
    adflexContent;

  const nav = resolveNavigation(navigation, { onHome: true });
  const aboutGlimpse = about.items.find((item) => item.id === about.home.itemId);

  return (
    <>
      <AdflexHeader logo={brand.logo} navigation={nav} />

      <main id="main-content">
        <AdflexHero id="home" content={hero} />

        {/* A glimpse of one About item only â€” the verbatim opening sentence of
            its full text, which lives on /about. The item's own title is not
            repeated here because the section heading already names it. */}
        {/* Split layout: this section is short, and stacked it left most of the
            width empty under a single paragraph. */}
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

        {/* Deep band: these four cards are led by dark imagery, so they sit in
            the dark rather than as dark blocks on a light page. */}
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
                // The first row can be in view on a tall desktop screen.
                priority={index < 2}
              />
            ))}
          </div>
        </SectionShell>

        {/* Light band: the partner logos need a light ground. */}
        <SectionShell
          id="consortium"
          eyebrow="Who is involved"
          title={consortium.title}
          intro={consortium.intro}
          introFigure={consortium.introFigure}
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
    </>
  );
}
