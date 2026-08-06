import type { Metadata } from "next";
import { adflexContent, resolveNavigation } from "@/content/adflex";
import { canonical } from "@/lib/site";
import { AdflexHeader } from "@/components/AdflexHeader";
import { AdflexFooter } from "@/components/AdflexFooter";
import { ContactBlock } from "@/components/ContactBlock";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";
import { isDatabaseConfigured } from "@/lib/db";
import styles from "./contact.module.css";

const { brand, navigation, contact, contactForm } = adflexContent;

export const metadata: Metadata = {
  title: contact.title,
  description: contact.pageDescription,
  ...canonical("/contact"),
};

/**
 * Contact details on their own route.
 *
 * Section anchors in the navigation only resolve on the home page, so they are
 * resolved here with `onHome: false`.
 *
 * Rendered per request only so the form knows whether a database exists to
 * receive a submission. Without one it renders exactly as it did before the
 * admin was built: disabled, with the note saying so. The email address beside
 * it is the working route either way.
 */
export const dynamic = "force-dynamic";

export default function ContactPage() {
  const nav = resolveNavigation(navigation, { onHome: false });
  const formEnabled = isDatabaseConfigured();

  return (
    <>
      <AdflexHeader logo={brand.logo} navigation={nav} homeHref="/" />

      <main id="main-content">
        <PageHero
          eyebrow="Get in touch"
          title={contact.title}
          lead={contact.intro}
        />

        <div className={styles.body}>
          <div className={`adflex-container ${styles.layout}`}>
            <ContactBlock contact={contact} showIntro={false} />
            <ContactForm form={contactForm} enabled={formEnabled} />
          </div>
        </div>
      </main>

      <AdflexFooter logo={brand.logo} />
    </>
  );
}

