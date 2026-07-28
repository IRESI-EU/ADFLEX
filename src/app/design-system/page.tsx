import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { adflexContent } from "@/content/adflex";
import { designSystemContent } from "@/content/design-system";
import { AdflexHeader } from "@/components/AdflexHeader";
import { AdflexFooter } from "@/components/AdflexFooter";
import { DesignSystemNav } from "@/components/DesignSystemNav";
import { TechnologyCard } from "@/components/TechnologyCard";
import { PartnerCard } from "@/components/PartnerCard";
import { EmptyState } from "@/components/EmptyState";
import { ContactBlock } from "@/components/ContactBlock";
import styles from "./design-system.module.css";

export const metadata: Metadata = {
  title: `${designSystemContent.meta.title} — ADFLEX`,
  description: designSystemContent.meta.description,
};

const ds = designSystemContent;

/**
 * Documentation for the ADFLEX implementation.
 *
 * Every example below is rendered with the production component or the
 * production CSS class it documents, and the page is styled from the same
 * scoped tokens as the public site. No component is duplicated for docs.
 */
export default function DesignSystemPage() {
  const { brand, hero, technologies, consortium, results, contact, footer } =
    adflexContent;

  return (
    <>
      <AdflexHeader
        logo={brand.logo}
        navigation={[]}
        homeHref="/"
        navLabel="Design system"
        trailingLink={{ label: ds.meta.backLabel, href: "/" }}
      />

      <main id="main-content" className={styles.main}>
        <div className={`adflex-container ${styles.layout}`}>
          <aside className={styles.sidebar}>
            <DesignSystemNav title={ds.meta.navTitle} sections={ds.sections} />
          </aside>

          <div className={styles.content}>
            <div className={styles.pageHead}>
              <h1>{ds.meta.title}</h1>
              <p className={styles.lead}>{ds.meta.description}</p>
              <p>
                <Link className="adflex-link" href="/">
                  {ds.meta.backLabel}
                </Link>
              </p>
            </div>

            {/* 1 — Introduction ------------------------------------- */}
            <Section id="introduction" title={ds.sections[0].title}>
              <p className={styles.lead}>{ds.introduction.lead}</p>
              <ul className={styles.bullets}>
                {ds.introduction.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </Section>

            {/* 2 — Brand & Foundations ------------------------------ */}
            <Section id="brand-foundations" title={ds.sections[1].title}>
              <h3 className={styles.subhead}>Colour</h3>
              <ul className={styles.swatchGrid}>
                {ds.colours.map((colour) => (
                  <li key={colour.token} className={styles.swatch}>
                    <span
                      className={styles.swatchChip}
                      style={{ background: `var(${colour.token})` }}
                      aria-hidden="true"
                    />
                    <span className={styles.swatchName}>{colour.name}</span>
                    <code className={styles.code}>{colour.token}</code>
                    <span className={styles.swatchHex}>{colour.hex}</span>
                    <span className={styles.swatchUsage}>{colour.usage}</span>
                  </li>
                ))}
              </ul>

              <h3 className={styles.subhead}>Typography</h3>
              <p className={styles.note}>
                One system-font stack, <code className={styles.code}>--adflex-font-sans</code>.
                No web fonts are loaded.
              </p>
              <div className={styles.specimenList}>
                <p className={styles.specimen3xl}>Heading level 1</p>
                <p className={styles.specimen2xl}>Heading level 2</p>
                <p className={styles.specimenLg}>Heading level 3</p>
                <p className={styles.specimenBase}>
                  Body copy sets the rhythm for every section on the site.
                </p>
                <p className={styles.specimenSm}>
                  Small text is used for captions, labels and navigation.
                </p>
              </div>
              <TokenTable
                caption="Type scale"
                rows={ds.typography}
                valueHeading="Size"
              />

              <h3 className={styles.subhead}>Spacing</h3>
              <ul className={styles.spacingList}>
                {ds.spacing.map((step) => (
                  <li key={step.token} className={styles.spacingRow}>
                    <code className={styles.code}>{step.token}</code>
                    <span
                      className={styles.spacingBar}
                      style={{ width: `var(${step.token})` }}
                      aria-hidden="true"
                    />
                    <span className={styles.spacingValue}>{step.value}</span>
                  </li>
                ))}
              </ul>

              <h3 className={styles.subhead}>Border radius</h3>
              <ul className={styles.sampleRow}>
                {ds.radii.map((radius) => (
                  <li key={radius.token} className={styles.sample}>
                    <span
                      className={styles.radiusBox}
                      style={{ borderRadius: `var(${radius.token})` }}
                      aria-hidden="true"
                    />
                    <code className={styles.code}>{radius.token}</code>
                    <span className={styles.sampleValue}>{radius.value}</span>
                  </li>
                ))}
              </ul>

              <h3 className={styles.subhead}>Elevation</h3>
              <ul className={styles.sampleRow}>
                {ds.shadows.map((shadow) => (
                  <li key={shadow.token} className={styles.sample}>
                    <span
                      className={styles.shadowBox}
                      style={{ boxShadow: `var(${shadow.token})` }}
                      aria-hidden="true"
                    />
                    <code className={styles.code}>{shadow.token}</code>
                    <span className={styles.sampleValue}>{shadow.usage}</span>
                  </li>
                ))}
              </ul>

              <h3 className={styles.subhead}>Layout tokens</h3>
              <TokenTable
                caption="Layout tokens"
                rows={ds.layoutTokens}
                valueHeading="Value"
              />
            </Section>

            {/* 3 — Logo & Imagery ----------------------------------- */}
            <Section id="logo-imagery" title={ds.sections[2].title}>
              <p className={styles.lead}>{ds.logoRules.intro}</p>

              {/* The logo has an opaque white background, so even inside a
                  tinted example it is given an intentional white surface. */}
              <div className={styles.logoStage}>
                <div className={styles.logoSurface}>
                  <Image
                    className={styles.logoImage}
                    src={brand.logo.src}
                    alt={brand.logo.alt}
                    width={brand.logo.width}
                    height={brand.logo.height}
                    sizes="(max-width: 720px) 80vw, 420px"
                  />
                </div>
                <p className={styles.caption}>
                  The official logo on a white surface with clear space. This is
                  the only presentation in use.
                </p>
              </div>

              <div className={styles.ruleColumns}>
                <div>
                  <h3 className={styles.subhead}>Do</h3>
                  <ul className={styles.bullets}>
                    {ds.logoRules.dos.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className={styles.subhead}>Do not</h3>
                  <ul className={styles.bullets}>
                    {ds.logoRules.donts.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className={styles.note}>
                No incorrect logo example is shown on this page. Rendering a
                distorted, recoloured, cropped or reversed version would mean
                producing exactly the asset the rules prohibit.
              </p>

              <h3 className={styles.subhead}>System diagram</h3>
              <p>{ds.imageryRules.intro}</p>
              <figure className={styles.diagramFigure}>
                <Image
                  className={styles.diagramImage}
                  src={hero.diagram.src}
                  alt={hero.diagram.alt}
                  width={hero.diagram.width}
                  height={hero.diagram.height}
                  sizes="(max-width: 1200px) 100vw, 800px"
                />
                <figcaption className={styles.caption}>
                  {hero.diagram.caption}
                </figcaption>
              </figure>
              <ul className={styles.bullets}>
                {ds.imageryRules.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </Section>

            {/* 4 — Components --------------------------------------- */}
            <Section id="components" title={ds.sections[3].title}>
              <p className={styles.lead}>
                Each example below is the production component or production CSS
                class, rendered with real ADFLEX content.
              </p>

              <Example
                label="Primary call to action"
                note=".adflex-cta — one primary action per view."
              >
                <Link className="adflex-cta" href="/#results">
                  {hero.cta.label}
                </Link>
              </Example>

              <Example
                label="Text link"
                note=".adflex-link — underlined, meaningful on its own."
              >
                <Link className="adflex-link" href="/#contact">
                  Contact the ADFLEX team
                </Link>
              </Example>

              <Example
                label="Tags"
                note=".adflex-tag inside .adflex-tag-list — labelling only, never interactive."
              >
                <ul className="adflex-tag-list">
                  {hero.tags.map((tag) => (
                    <li key={tag} className="adflex-tag">
                      {tag}
                    </li>
                  ))}
                </ul>
              </Example>

              <Example
                label="TechnologyCard"
                note="Numeric mark, name and description. The mark is decorative and hidden from assistive technology."
              >
                <TechnologyCard technology={technologies.items[0]} index={1} />
              </Example>

              <Example
                label="PartnerCard"
                note="Name only. Roles, descriptions, logos and URLs have not been supplied; the initials are decorative."
              >
                <PartnerCard partner={consortium.partners[0]} />
              </Example>

              <Example
                label="EmptyState"
                note="Used where content genuinely does not exist yet. Never replaced with placeholder items."
              >
                <EmptyState heading={results.heading} body={results.body} />
              </Example>

              <Example
                label="ContactBlock"
                note="Definition list with a mailto link. There is no contact form."
              >
                <ContactBlock contact={contact} showIntro={false} />
              </Example>
            </Section>

            {/* 5 — Layout & Patterns -------------------------------- */}
            <Section id="layout-patterns" title={ds.sections[4].title}>
              <p className={styles.lead}>
                These patterns are page-level structures. They are described
                here rather than re-rendered inside this column, because
                reproducing them out of context would mean building a second
                copy of the production layout.
              </p>
              {ds.layoutPatterns.map((pattern) => (
                <div key={pattern.title} className={styles.patternBlock}>
                  <h3 className={styles.subhead}>{pattern.title}</h3>
                  <ul className={styles.bullets}>
                    {pattern.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </Section>

            {/* 6 — Accessibility & Content Rules -------------------- */}
            <Section id="accessibility" title={ds.sections[5].title}>
              {ds.accessibilityRules.map((group) => (
                <div key={group.title} className={styles.patternBlock}>
                  <h3 className={styles.subhead}>{group.title}</h3>
                  <ul className={styles.bullets}>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className={styles.note}>{ds.scopeNote}</p>
            </Section>
          </div>
        </div>
      </main>

      <AdflexFooter
        logo={brand.logo}
        navigation={adflexContent.navigation}
        contact={contact}
        labels={footer}
        hrefPrefix="/"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Local documentation-only helpers                                    */
/* These arrange documentation; they do not restyle or reimplement any  */
/* production component.                                               */
/* ------------------------------------------------------------------ */

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={styles.section}>
      <h2 id={`${id}-heading`}>{title}</h2>
      {children}
    </section>
  );
}

function Example({
  label,
  note,
  children,
}: {
  label: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.example}>
      <p className={styles.exampleLabel}>{label}</p>
      <div className={styles.exampleStage}>{children}</div>
      <p className={styles.note}>{note}</p>
    </div>
  );
}

function TokenTable({
  caption,
  rows,
  valueHeading,
}: {
  caption: string;
  rows: readonly { token: string; value: string; usage: string }[];
  valueHeading: string;
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className={styles.tableCaption}>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">{valueHeading}</th>
            <th scope="col">Used for</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.token}>
              <td>
                <code className={styles.code}>{row.token}</code>
              </td>
              <td>{row.value}</td>
              <td>{row.usage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
