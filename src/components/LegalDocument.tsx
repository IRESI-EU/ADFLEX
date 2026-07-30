import { Fragment, type ReactNode } from "react";
import type { LegalBlock } from "@/content/adflex";
import styles from "./LegalDocument.module.css";

type LegalDocumentProps = {
  /** Shown above the text, naming the source document and its status. */
  status: string;
  blocks: readonly LegalBlock[];
};

/**
 * Matches an email address or a bare `www.` domain.
 *
 * Deliberately narrow. The supplied legal text contains a handful of contact
 * addresses and one regulator URL, and those should be reachable rather than
 * printed as dead text — but a legal document is the last place to run a loose
 * auto-linker over. Anything this pattern does not match is rendered as the
 * plain string it is.
 */
const LINK = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})|(www\.[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

/**
 * Square-bracketed placeholders in the source, e.g.
 * `[www.adflex.ie / adflex domain TBC]` or `[month/year]`.
 *
 * Nothing inside one is linked. The brackets are the source document's own way
 * of saying "not confirmed yet", and turning an unconfirmed domain into a live
 * link would publish a link to a site that may not exist — while also making
 * the placeholder look like a settled decision.
 */
const PLACEHOLDER = /\[[^\]]*\]/g;

function isInsidePlaceholder(text: string, index: number) {
  for (const p of text.matchAll(PLACEHOLDER)) {
    if (index >= p.index && index < p.index + p[0].length) return true;
  }
  return false;
}

/**
 * Renders supplied text, linking email addresses and `www.` domains.
 *
 * Trailing punctuation is trimmed off the match so a sentence-ending full stop
 * or a closing bracket does not end up inside the href.
 */
function LegalText({ text }: { text: string }): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const match of text.matchAll(LINK)) {
    if (isInsidePlaceholder(text, match.index)) continue;
    const start = match.index;
    let value = match[0];
    // `(www.dataprotection.ie)` — keep the bracket in the text, not the link.
    const trailing = value.match(/[.,;:)\]]+$/)?.[0] ?? "";
    if (trailing) value = value.slice(0, -trailing.length);
    if (!value) continue;

    if (start > last) out.push(text.slice(last, start));
    const isEmail = value.includes("@");
    out.push(
      <a
        key={`l${key++}`}
        className="adflex-inline-link"
        href={isEmail ? `mailto:${value}` : `https://${value}`}
        {...(isEmail
          ? {}
          : { target: "_blank", rel: "noreferrer noopener" })}
      >
        {value}
      </a>,
    );
    if (trailing) out.push(trailing);
    last = start + match[0].length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out.length ? out : text;
}

/**
 * Renders one legal document from structured blocks.
 *
 * The blocks are plain data in `src/content/adflex.ts`, transcribed verbatim
 * from the supplied source document. Nothing here parses Markdown or HTML: a
 * string in the content file is exactly the string that appears on the page,
 * apart from the narrow email/URL linking above. That is deliberate — legal
 * wording should be checkable against its source line by line, and a markup
 * pipeline in between makes that harder and adds an injection surface.
 *
 * Headings are `h2`. The page's single `h1` is the document title in the hero,
 * so these sit one level below it and the outline stays correct.
 */
export function LegalDocument({ status, blocks }: LegalDocumentProps) {
  return (
    <section className={styles.section} aria-label="Document text">
      <div className={`adflex-container ${styles.inner}`}>
        {/* Stated plainly rather than buried: this is a draft, and a reader
            deserves to know that before reading it as settled policy. */}
        <p className={styles.status}>{status}</p>

        <div className={styles.body}>
          {blocks.map((block, i) => {
            switch (block.kind) {
              case "heading":
                return (
                  <h2 key={i} className={styles.heading}>
                    {block.text}
                  </h2>
                );

              case "paragraph":
                return (
                  <p key={i} className={styles.paragraph}>
                    <LegalText text={block.text} />
                  </p>
                );

              case "list":
                return block.ordered ? (
                  <ol key={i} className={styles.orderedList}>
                    {block.items.map((item) => (
                      <li key={item} className={styles.listItem}>
                        <LegalText text={item} />
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ul key={i} className={styles.list}>
                    {block.items.map((item) => (
                      <li key={item} className={styles.listItem}>
                        <LegalText text={item} />
                      </li>
                    ))}
                  </ul>
                );

              case "table":
                return (
                  /* Scrolls inside its own container rather than widening the
                     page — three columns of prose do not fit at phone width. */
                  <div key={i} className={styles.tableWrap}>
                    <table className={styles.table}>
                      <caption className={styles.tableCaption}>
                        {block.caption}
                      </caption>
                      <thead>
                        <tr>
                          {block.head.map((cell) => (
                            <th key={cell} scope="col" className={styles.th}>
                              {cell}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((row) => (
                          <tr key={row[0]}>
                            {row.map((cell, c) => (
                              <Fragment key={c}>
                                {c === 0 ? (
                                  <th scope="row" className={styles.rowHead}>
                                    {cell}
                                  </th>
                                ) : (
                                  <td className={styles.td}>{cell}</td>
                                )}
                              </Fragment>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
            }
          })}
        </div>
      </div>
    </section>
  );
}
