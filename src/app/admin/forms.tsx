"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "./actions";
import { saveNewsItem, saveOutcome, signIn } from "./actions";
import type { FileRef, Finding, MediaRef, NewsItem, NewsKind, Publication } from "@/lib/repo";
import {
  ACCEPT_ATTRIBUTE,
  DOCUMENT_ACCEPT,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_TOTAL_BYTES,
  fileKind,
  fileSize,
  mb,
} from "@/lib/upload-limits";
import styles from "./admin.module.css";

/**
 * The admin's interactive forms.
 *
 * Client components only because `useActionState` needs to be — everything they
 * submit to is a Server Action, so no fetch, no client-side validation library
 * and no API surface of our own. A failed save re-renders with its message and
 * the typed values intact, which is the whole reason for `useActionState` here
 * rather than a plain `<form action={...}>`.
 */

const EMPTY: ActionState = {};

/** True for either kind of event. Mirrors `isEvent` in the repo, which this
    client component cannot import — that module is `server-only`. */
const isEventKind = (kind: NewsKind) => kind === "event" || kind === "upcoming";

function Submit({ label = "Save" }: { label?: string }) {
  // `useFormStatus` must be read by a child of the form, not the form itself.
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="adflex-cta" disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}

/**
 * The publish checkbox.
 *
 * Its label is the tense of what the tick means. Unticked it reads **Publish**,
 * because that is the action about to be taken; ticked it reads **Published**,
 * because that is then the state. Labelling it "Published" while unticked
 * described a state the entry was not in, which is exactly the wrong thing for
 * the one control that decides public visibility.
 *
 * Controlled, so the wording changes as it is ticked rather than only after the
 * save comes back.
 */
function PublishCheck({ defaultChecked }: { defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <label className={styles.check}>
      <input
        type="checkbox"
        name="published"
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
      />
      {checked ? (
        <span>
          <strong>Published</strong> — visible on the public site
        </span>
      ) : (
        <span>
          <strong>Publish</strong> — tick to make this visible on the public site
        </span>
      )}
    </label>
  );
}

/**
 * What a field should show after a failed save.
 *
 * A Server Action re-renders the form from nothing, so every input falls back
 * to its `defaultValue` unless the action hands the submitted text back. These
 * two helpers read that: `keep` restores what was typed, and `fieldError` marks
 * the single field the action blamed.
 *
 * The blamed field is deliberately absent from `state.values`, so it comes back
 * empty and ready to retype while everything around it survives — a mistyped
 * DOI no longer costs the editor a body they spent ten minutes on.
 */
function keep(state: ActionState, name: string, fallback: string | number = "") {
  return state.values?.[name] ?? String(fallback ?? "");
}

/** Props that mark an input as the one that failed, and point at its message. */
function fieldError(state: ActionState, name: string) {
  const failed = state.field === name;
  return {
    isInvalid: failed,
    message: failed ? state.error : undefined,
    inputProps: failed
      ? ({ "aria-invalid": true, "aria-describedby": `${name}-error` } as const)
      : {},
  };
}

/**
 * "No places left" for an event.
 *
 * Reads its state in the present tense, like `PublishCheck`, so the label
 * always describes what is true rather than what ticking it would do.
 *
 * Deliberately a flag and not a number of places. The project does not run the
 * booking system, so a count here would be a stale copy of someone else's
 * state — wrong the moment a place is taken, and wrong in the direction that
 * disappoints people. A flag an editor sets when they know it is full is a
 * smaller claim and a true one.
 */
function SlotsFilledCheck({ defaultChecked }: { defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <label className={styles.check}>
      <input
        type="checkbox"
        name="slotsFilled"
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
      />
      {checked ? (
        <span>
          <strong>No places left</strong> — the News &amp; Events page says the
          event is fully booked and stops offering the booking link, and it is
          no longer announced on the home page
        </span>
      ) : (
        <span>
          <strong>Places available</strong> — tick when the event is full
        </span>
      )}
    </label>
  );
}

/**
 * Marks a field the form will not save without.
 *
 * Beside the label, in words, rather than the bare asterisk that convention
 * uses and that means nothing on its own — an asterisk needs a legend somewhere
 * else on the page explaining it, which is one more thing to find and one more
 * thing to keep in step.
 *
 * `aria-hidden` because the input itself carries `required`, which assistive
 * technology already announces; without this the field would be read as
 * "Title required required".
 */
function Required() {
  return (
    <span className={styles.required} aria-hidden="true">
      Required
    </span>
  );
}

/** The message shown directly under the field that caused it. */
function FieldError({ state, name }: { state: ActionState; name: string }) {
  if (state.field !== name || !state.error) return null;
  return (
    <span id={`${name}-error`} className={styles.error} role="alert">
      {state.error}
    </span>
  );
}

function Banner({ state }: { state: ActionState }) {
  // A field-level failure is reported next to the field itself; repeating it in
  // a banner at the top of the form says the same thing twice.
  if (state.error && state.field) return null;
  if (state.error) {
    return (
      <p className={styles.error} role="alert">
        <strong>Not saved.</strong> {state.error}
      </p>
    );
  }
  if (state.ok) {
    return (
      <p className={styles.success} role="status">
        <strong>Saved.</strong> {state.ok}
      </p>
    );
  }
  return null;
}

/**
 * The images field, shared by findings and news.
 *
 * Handles an ordered set rather than one picture: each attached image can be
 * moved, removed or re-described, and any number of new files can be added at
 * once.
 *
 * **Order is expressed by the order of the `keepImage` inputs**, not by an index
 * written into each one. Reordering therefore only has to reorder the array
 * here; the server reads `form.getAll("keepImage")`, which preserves document
 * order, so the two cannot disagree about what position 3 means.
 */
function ImagesField({ existing }: { existing: MediaRef[] }) {
  const [kept, setKept] = useState(existing);
  const [picked, setPicked] = useState<string[]>([]);
  const [tooBig, setTooBig] = useState<string | null>(null);

  const move = (index: number, by: number) => {
    const to = index + by;
    if (to < 0 || to >= kept.length) return;
    const next = [...kept];
    [next[index], next[to]] = [next[to], next[index]];
    setKept(next);
  };

  /**
   * Checks sizes before the form is ever submitted.
   *
   * Not a security control — `src/lib/upload.ts` re-checks on the server, which
   * is the check that counts. This exists so an editor who picks a 12 MB
   * photograph is told at once, instead of waiting for a whole upload that was
   * always going to be refused.
   *
   * **Both limits, and the total is the one that was missing.** Every chosen
   * file goes up in a single request, so a batch of individually-legal images
   * can still be far too large together. Checking only per-file let four 4 MB
   * photographs through to the framework's own body limit, which fails with a
   * runtime error page instead of anything useful.
   */
  const onPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];

    const reject = (message: string) => {
      setTooBig(message);
      event.target.value = "";
      setPicked([]);
    };

    const over = files.find((file) => file.size > MAX_UPLOAD_BYTES);
    if (over) {
      return reject(
        `“${over.name}” is ${(over.size / 1024 / 1024).toFixed(1)} MB. The limit is ${mb(MAX_UPLOAD_BYTES)} per image — please resize it and choose again.`,
      );
    }

    const total = files.reduce((sum, file) => sum + file.size, 0);
    if (total > MAX_UPLOAD_TOTAL_BYTES) {
      return reject(
        `Those ${files.length} images come to ${(total / 1024 / 1024).toFixed(1)} MB together. The limit is ${mb(MAX_UPLOAD_TOTAL_BYTES)} per save — add them in two goes, or resize them first.`,
      );
    }

    setTooBig(null);
    setPicked(files.map((file) => file.name));
  };

  return (
    <fieldset className={styles.imagesField}>
      <legend className={styles.label}>Images</legend>

      {kept.length > 0 ? (
        <ul className={styles.imageList}>
          {kept.map((image, index) => (
            <li key={image.id} className={styles.imageRow}>
              {/* eslint-disable-next-line @next/next/no-img-element -- served
                  from the database at /media/[id]; next/image cannot optimise a
                  route it has no build-time knowledge of. */}
              <img className={styles.thumb} src={`/media/${image.id}`} alt="" />

              {/* The position of this input in the document *is* the position
                  of the image. */}
              <input type="hidden" name="keepImage" value={image.id} />

              <div className={styles.imageMeta}>
                <label className={styles.hint} htmlFor={`alt-${image.id}`}>
                  Description (for screen readers — leave empty if decorative)
                </label>
                <input
                  id={`alt-${image.id}`}
                  className={styles.input}
                  name={`imageAlt:${image.id}`}
                  defaultValue={image.alt}
                  maxLength={300}
                />
                <span className={styles.hint}>
                  {image.width && image.height
                    ? `${image.width} × ${image.height} pixels`
                    : "Size unknown — will be shown in a 3:2 frame"}
                </span>
              </div>

              <div className={styles.imageButtons}>
                <button
                  type="button"
                  className={styles.tab}
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move image ${index + 1} earlier`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.tab}
                  onClick={() => move(index, 1)}
                  disabled={index === kept.length - 1}
                  aria-label={`Move image ${index + 1} later`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={styles.danger}
                  onClick={() => setKept(kept.filter((k) => k.id !== image.id))}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.hint}>No images attached yet.</p>
      )}

      <label className={styles.label} htmlFor="images">
        Add images
      </label>
      <input
        id="images"
        className={styles.input}
        type="file"
        name="images"
        accept={ACCEPT_ATTRIBUTE}
        multiple
        onChange={onPick}
      />
      {tooBig ? (
        <span className={styles.error} role="alert">
          {tooBig}
        </span>
      ) : null}
      <span className={styles.hint}>
        PNG, JPEG, WebP or GIF, up to {mb(MAX_UPLOAD_BYTES)} each and{" "}
        {mb(MAX_UPLOAD_TOTAL_BYTES)} in one save. SVG is not accepted. Choose
        several at once if you want a gallery.
      </span>

      {/*
       * One description per chosen image, matched to the server by position.
       *
       * There used to be a single box applied to everything added at once,
       * which is only right when the images are variations of one thing. These
       * are named `newImageAlt:<n>` in the same order the file input reported
       * the files, and `resolveImages` reads them back by the same index.
       *
       * Each is optional. An empty one means the image is decorative, which is
       * the correct answer surprisingly often — a photograph illustrating a
       * paragraph that already describes it needs no alt text.
       */}
      {picked.length > 0 ? (
        <ul className={styles.newImageList}>
          {picked.map((name, index) => (
            <li key={`${name}-${index}`} className={styles.newImageRow}>
              <label className={styles.hint} htmlFor={`newImageAlt-${index}`}>
                Description for <strong>{name}</strong> (optional — leave empty
                if it is decorative)
              </label>
              <input
                id={`newImageAlt-${index}`}
                className={styles.input}
                name={`newImageAlt:${index}`}
                maxLength={300}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {/* The fallback for a browser with JavaScript off, where the per-image
          inputs above are never rendered: one description for the whole batch,
          which is what `resolveImages` falls back to. */}
      <noscript>
        <label className={styles.label} htmlFor="newImageAlt">
          Description for the new images
        </label>
        <input
          id="newImageAlt"
          className={styles.input}
          name="newImageAlt"
          maxLength={300}
        />
      </noscript>

      {/*
       * There is no size chooser any more. Every entry's images are drawn at
       * one size — see `IMAGE_SIZE` in actions.ts for why, and for how to put
       * the choice back.
       */}
      <span className={styles.hint}>
        Images appear beside the text, about half the page width. With more than
        one they become a gallery a reader can swipe through, and any of them can
        be opened full size. Each keeps its own shape, so nothing is cropped or
        padded.
      </span>
    </fieldset>
  );
}

/**
 * The attached-documents field, shared by findings and publications.
 *
 * The same shape as `ImagesField` — keep, relabel, reorder, remove, add — but
 * for things that are downloaded rather than rendered. Order is again carried
 * by the order of the `keepFile` inputs.
 */
function FilesField({ existing }: { existing: FileRef[] }) {
  const [kept, setKept] = useState(existing);
  const [picked, setPicked] = useState<string[]>([]);
  const [tooBig, setTooBig] = useState<string | null>(null);

  const move = (index: number, by: number) => {
    const to = index + by;
    if (to < 0 || to >= kept.length) return;
    const next = [...kept];
    [next[index], next[to]] = [next[to], next[index]];
    setKept(next);
  };

  // Same reasoning as the image picker: refuse early rather than after an
  // upload that was always going to be rejected. The server re-checks.
  const onPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];
    const reject = (message: string) => {
      setTooBig(message);
      event.target.value = "";
      setPicked([]);
    };

    const over = files.find((file) => file.size > MAX_UPLOAD_BYTES);
    if (over) {
      return reject(
        `“${over.name}” is ${(over.size / 1024 / 1024).toFixed(1)} MB. The limit is ${mb(MAX_UPLOAD_BYTES)} per file.`,
      );
    }
    const total = files.reduce((sum, file) => sum + file.size, 0);
    if (total > MAX_UPLOAD_TOTAL_BYTES) {
      return reject(
        `Those ${files.length} files come to ${(total / 1024 / 1024).toFixed(1)} MB together. The limit is ${mb(MAX_UPLOAD_TOTAL_BYTES)} per save.`,
      );
    }

    setTooBig(null);
    setPicked(files.map((file) => file.name));
  };

  return (
    <fieldset className={styles.imagesField}>
      <legend className={styles.label}>Files to download</legend>

      {kept.length > 0 ? (
        <ul className={styles.imageList}>
          {kept.map((file, index) => (
            <li key={file.id} className={styles.imageRow}>
              <span className={styles.fileKind} aria-hidden="true">
                {fileKind(file.filename)}
              </span>

              {/* Position in the document is position on the page. */}
              <input type="hidden" name="keepFile" value={file.id} />

              <div className={styles.imageMeta}>
                <label className={styles.hint} htmlFor={`fileLabel-${file.id}`}>
                  Link text (optional — the filename is used if you leave it
                  empty)
                </label>
                <input
                  id={`fileLabel-${file.id}`}
                  className={styles.input}
                  name={`fileLabel:${file.id}`}
                  defaultValue={file.label}
                  maxLength={200}
                />
                <span className={styles.hint}>
                  {file.filename} · {fileSize(file.byte_size)}
                </span>
              </div>

              <div className={styles.imageButtons}>
                <button
                  type="button"
                  className={styles.tab}
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move file ${index + 1} earlier`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.tab}
                  onClick={() => move(index, 1)}
                  disabled={index === kept.length - 1}
                  aria-label={`Move file ${index + 1} later`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={styles.danger}
                  onClick={() => setKept(kept.filter((k) => k.id !== file.id))}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.hint}>No files attached yet.</p>
      )}

      <label className={styles.label} htmlFor="files">
        Add files
      </label>
      <input
        id="files"
        className={styles.input}
        type="file"
        name="files"
        accept={DOCUMENT_ACCEPT}
        multiple
        onChange={onPick}
      />
      {tooBig ? (
        <span className={styles.error} role="alert">
          {tooBig}
        </span>
      ) : null}
      <span className={styles.hint}>
        PDF, Word, PowerPoint or Excel, up to {mb(MAX_UPLOAD_BYTES)} each and{" "}
        {mb(MAX_UPLOAD_TOTAL_BYTES)} in one save. Readers get a download link;
        files are never opened in the browser.
      </span>

      {picked.length > 0 ? (
        <ul className={styles.newImageList}>
          {picked.map((name, index) => (
            <li key={`${name}-${index}`} className={styles.newImageRow}>
              <label className={styles.hint} htmlFor={`newFileLabel-${index}`}>
                Link text for <strong>{name}</strong> (optional)
              </label>
              <input
                id={`newFileLabel-${index}`}
                className={styles.input}
                name={`newFileLabel:${index}`}
                maxLength={200}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </fieldset>
  );
}

/* --------------------------------------------------------------------------
 * Login
 * ----------------------------------------------------------------------- */

export function LoginForm() {
  const [state, action] = useActionState(signIn, EMPTY);

  return (
    <form className={styles.form} action={action}>
      <Banner state={state} />

      <p className={styles.field}>
        <label className={styles.label} htmlFor="username">
          Username <Required />
        </label>
        {/*
         * `type="text"`, not `type="email"`. The account is identified by a
         * username, and an email input would refuse to submit anything without
         * an @ in it — telling an editor their correct username is malformed.
         *
         * `autoComplete="username"` is unchanged and is the right value either
         * way: it is what tells a password manager which field to fill.
         */}
        <input
          id="username"
          className={styles.input}
          type="text"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
        />
      </p>

      <p className={styles.field}>
        <label className={styles.label} htmlFor="password">
          Password <Required />
        </label>
        <input
          id="password"
          className={styles.input}
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </p>

      <p className={styles.actions}>
        <Submit label="Sign in" />
      </p>
    </form>
  );
}

/* --------------------------------------------------------------------------
 * Outcomes: findings and publications, one form
 * ----------------------------------------------------------------------- */

/**
 * The Outcomes editor.
 *
 * `/outcomes` publishes two different things, and this is one form with a type
 * selector that swaps the fields between them — the same shape as News &
 * Events, which does the same for news posts and events.
 *
 * ---------------------------------------------------------------------------
 * THE TYPE IS FIXED ONCE AN ENTRY EXISTS
 * ---------------------------------------------------------------------------
 * A finding and a publication are separate rows in separate tables, because
 * they genuinely are different records: one has a body and images, the other
 * has authors, a venue and a DOI. Changing the type of a saved entry would mean
 * deleting it from one table and inserting into the other, losing its id, its
 * posting date and anything linking to it.
 *
 * So when editing, the selector is replaced by a plain statement of what this
 * entry is, with a hidden input carrying the value. A disabled `<select>` would
 * look like the same thing and would submit nothing at all, which would quietly
 * save every edited publication as a finding.
 */
export function OutcomeForm({
  finding,
  publication,
}: {
  finding?: Finding;
  publication?: Publication;
}) {
  const [state, action] = useActionState(saveOutcome, EMPTY);
  const editing = Boolean(finding ?? publication);
  const [kind, setKind] = useState<"finding" | "publication">(
    publication ? "publication" : "finding",
  );

  const entry = finding ?? publication;

  return (
    <form className={styles.form} action={action}>
      <Banner state={state} />
      {entry ? <input type="hidden" name="id" value={entry.id} /> : null}

      <p className={styles.field}>
        <label className={styles.label} htmlFor="o-kind">
          Type
        </label>
        {editing ? (
          <>
            <input type="hidden" name="kind" value={kind} />
            <span className={styles.staticValue}>
              {kind === "publication" ? "Publication" : "Project finding"}
            </span>
            <span className={styles.hint}>
              The type cannot be changed after saving — a finding and a
              publication are stored differently. Delete this and add it again if
              it is the wrong one.
            </span>
          </>
        ) : (
          <>
            <select
              id="o-kind"
              className={styles.select}
              name="kind"
              value={kind}
              onChange={(event) =>
                setKind(event.target.value as "finding" | "publication")
              }
            >
              <option value="finding">Project finding</option>
              <option value="publication">Publication</option>
            </select>
            <span className={styles.hint}>
              {kind === "publication"
                ? "A paper, report or deliverable, with authors and an optional DOI."
                : "A result the project can stand behind, with text and images."}
            </span>
          </>
        )}
      </p>

      <p className={styles.field}>
        <label className={styles.label} htmlFor="o-title">
          Title <Required />
        </label>
        <input
          id="o-title"
          className={styles.input}
          name="title"
          defaultValue={keep(state, "title", entry?.title ?? "")}
          maxLength={400}
          required
          {...fieldError(state, "title").inputProps}
        />
        <FieldError state={state} name="title" />
      </p>

      {kind === "finding" ? (
        <>
          <p className={styles.field}>
            <label className={styles.label} htmlFor="o-summary">
              Summary
            </label>
            <textarea
              id="o-summary"
              className={styles.textarea}
              name="summary"
              defaultValue={keep(state, "summary", finding?.summary ?? "")}
              rows={3}
            />
            <span className={styles.hint}>
              One or two sentences, shown in the list on /outcomes.
            </span>
          </p>

          <p className={styles.field}>
            <label className={styles.label} htmlFor="o-body">
              Detail
            </label>
            <textarea
              id="o-body"
              className={styles.textarea}
              name="body"
              defaultValue={keep(state, "body", finding?.body ?? "")}
              rows={7}
            />
            <span className={styles.hint}>
              Plain text. Blank lines start a new paragraph; no HTML or Markdown
              is interpreted, so pasted formatting will show as characters.
            </span>
          </p>

          <ImagesField existing={finding?.images ?? []} />
        </>
      ) : (
        <>
          <p className={styles.field}>
            <label className={styles.label} htmlFor="o-authors">
              Authors
            </label>
            <input
              id="o-authors"
              className={styles.input}
              name="authors"
              defaultValue={keep(state, "authors", publication?.authors ?? "")}
              maxLength={500}
            />
            <span className={styles.hint}>
              As they should appear, e.g. “Ó Broin, E., Smith, J.”
            </span>
          </p>

          <div className={styles.row}>
            <p className={styles.field}>
              <label className={styles.label} htmlFor="o-venue">
                Journal or conference
              </label>
              <input
                id="o-venue"
                className={styles.input}
                name="venue"
                defaultValue={keep(state, "venue", publication?.venue ?? "")}
                maxLength={300}
              />
            </p>

            <p className={styles.field}>
              <label className={styles.label} htmlFor="o-year">
                Year
              </label>
              <input
                id="o-year"
                className={styles.input}
                type="number"
                name="year"
                defaultValue={keep(state, "year", publication?.year ?? "")}
                min={1900}
                max={2200}
                {...fieldError(state, "year").inputProps}
              />
              <FieldError state={state} name="year" />
            </p>
          </div>

          {/*
           * The link comes first and the DOI second, and neither is required.
           *
           * It used to be the other way round, with the DOI presented as the
           * main way to reach a publication and the URL as the fallback "when
           * there is no DOI". That suits journal articles and nothing else: a
           * report, a deliverable, a dataset or a conference talk has a web
           * address and usually no DOI at all, and a publication that is not
           * online yet has neither.
           */}
          <p className={styles.field}>
            <label className={styles.label} htmlFor="o-url">
              Link
            </label>
            <input
              id="o-url"
              className={styles.input}
              type="url"
              name="url"
              defaultValue={keep(state, "url", publication?.url ?? "")}
              placeholder="https://…"
              {...fieldError(state, "url").inputProps}
            />
            <span className={styles.hint}>
              Optional. Where a reader can get the publication — a publisher
              page, a repository copy or a PDF. Shown as “Read the paper”.
            </span>
            <FieldError state={state} name="url" />
          </p>

          <p className={styles.field}>
            <label className={styles.label} htmlFor="o-doi">
              DOI
            </label>
            <input
              id="o-doi"
              className={styles.input}
              name="doi"
              defaultValue={keep(state, "doi", publication?.doi ?? "")}
              placeholder="10.1234/abcd"
              {...fieldError(state, "doi").inputProps}
            />
            <span className={styles.hint}>
              Optional. Leave empty if the publication has no DOI. A bare DOI or
              a full doi.org link are both accepted and stored the same way.
            </span>
            <FieldError state={state} name="doi" />
          </p>
        </>
      )}

      {/* Documents hang off either type: a finding may have its data behind it,
          a publication may be the PDF itself. */}
      <FilesField existing={entry?.files ?? []} />

      <div className={styles.row}>
        <p className={styles.field}>
          <label className={styles.label} htmlFor="o-order">
            Order
          </label>
          <input
            id="o-order"
            className={styles.input}
            type="number"
            name="sortOrder"
            defaultValue={entry?.sort_order ?? 0}
          />
          <span className={styles.hint}>Lower numbers first.</span>
        </p>

        <PublishCheck defaultChecked={entry?.published ?? false} />
      </div>

      <p className={styles.field}>
        <span className={styles.hint}>
          {entry
            ? `Posted ${entry.published_on}. Set when it was first saved and unchanged by editing.`
            : "The date posted is recorded automatically when you save."}
        </span>
      </p>

      <p className={styles.actions}>
        <Submit />
      </p>
    </form>
  );
}

/* --------------------------------------------------------------------------
 * News and events
 * ----------------------------------------------------------------------- */

export function NewsForm({ item }: { item?: NewsItem }) {
  const [state, action] = useActionState(saveNewsItem, EMPTY);
  // Controlled so the date and location fields can appear only for an event.
  // Three kinds now, not two — see `NewsKind`. `upcoming` is the only one that
  // offers a booking link, so the fields below follow this.
  const [kind, setKind] = useState<NewsKind>(item?.kind ?? "news");

  return (
    <form className={styles.form} action={action}>
      <Banner state={state} />
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      {/*
       * "Date posted" used to sit here as a field. It is now stamped
       * automatically when the entry is first saved — see `NewsInput` — so
       * there is nothing to fill in and nothing to get wrong. Editing an entry
       * later does not move its posting date.
       */}
      <p className={styles.field}>
        <label className={styles.label} htmlFor="n-kind">
          Type
        </label>
        <select
          id="n-kind"
          className={styles.select}
          name="kind"
          value={kind}
          onChange={(event) => setKind(event.target.value as NewsKind)}
        >
          <option value="news">News</option>
          <option value="upcoming">Upcoming event</option>
          <option value="event">Event (already held)</option>
        </select>
        <span className={styles.hint}>
          {kind === "upcoming"
            ? "Shown under Events, announced on the home page with a countdown, and able to carry a booking link."
            : kind === "event"
              ? "Shown under Events as a record of something that has happened. No booking link."
              : "An announcement, shown under News."}
        </span>
        <span className={styles.hint}>
          {item
            ? `Posted ${item.published_on}. Set when it was first saved and unchanged by editing.`
            : "The date posted is recorded automatically when you save."}
        </span>
      </p>

      <p className={styles.field}>
        <label className={styles.label} htmlFor="n-title">
          Title <Required />
        </label>
        <input
          id="n-title"
          className={styles.input}
          name="title"
          defaultValue={keep(state, "title", item?.title ?? "")}
          maxLength={300}
          required
          {...fieldError(state, "title").inputProps}
        />
        <FieldError state={state} name="title" />
      </p>

      {isEventKind(kind) ? (
        <div className={styles.row}>
          <p className={styles.field}>
            <label className={styles.label} htmlFor="n-event-date">
              Event date <Required />
            </label>
            <input
              id="n-event-date"
              className={styles.input}
              type="date"
              name="eventDate"
              defaultValue={keep(state, "eventDate", item?.event_date ?? "")}
              required
              {...fieldError(state, "eventDate").inputProps}
            />
            <FieldError state={state} name="eventDate" />
          </p>

          {/*
           * Start and end, next to the date because that is the question they
           * answer.
           *
           * Both are required for an **upcoming** event and optional for one
           * already held. An upcoming event is asking people to turn up, so it
           * has to say when; and its end time is the moment the entry comes off
           * the public page, so without one it would have to be taken down by
           * hand. A record of something that already happened is still a record
           * with no hour written down.
           *
           * `type="time"` gives a picker and the reader's own clock format,
           * 12- or 24-hour, while still submitting `HH:MM`.
           */}
          <p className={styles.field}>
            <label className={styles.label} htmlFor="n-event-time">
              Start time {kind === "upcoming" ? <Required /> : null}
            </label>
            <input
              id="n-event-time"
              className={styles.input}
              type="time"
              name="eventTime"
              defaultValue={keep(state, "eventTime", item?.event_time ?? "")}
              required={kind === "upcoming"}
              {...fieldError(state, "eventTime").inputProps}
            />
            <FieldError state={state} name="eventTime" />
            <span className={styles.hint}>
              {kind === "upcoming"
                ? "The countdown on the home page runs to this."
                : "Optional. Leave empty if it was not recorded."}
            </span>
          </p>

          <p className={styles.field}>
            <label className={styles.label} htmlFor="n-event-end-time">
              End time {kind === "upcoming" ? <Required /> : null}
            </label>
            <input
              id="n-event-end-time"
              className={styles.input}
              type="time"
              name="eventEndTime"
              defaultValue={keep(state, "eventEndTime", item?.event_end_time ?? "")}
              required={kind === "upcoming"}
              {...fieldError(state, "eventEndTime").inputProps}
            />
            <FieldError state={state} name="eventEndTime" />
            <span className={styles.hint}>
              {kind === "upcoming"
                ? "At this time the event moves to the past events, and stops taking bookings. It stays on the page."
                : "Optional. Leave empty if it was not recorded."}
            </span>
          </p>

          <p className={styles.field}>
            <label className={styles.label} htmlFor="n-location">
              Location
            </label>
            <input
              id="n-location"
              className={styles.input}
              name="location"
              defaultValue={keep(state, "location", item?.location ?? "")}
              maxLength={200}
            />
          </p>
        </div>
      ) : null}

      {/*
       * Booking, and whether there is any room left.
       *
       * Only for an **upcoming** event. An event that has already been held
       * has nothing to book, and offering the field there invited a link that
       * would be dead by the time anyone followed it.
       *
       * The booking link is whatever the project actually uses — an Eventbrite
       * page, a university form, a Teams registration — so it is a plain URL
       * rather than an integration with anything.
       */}
      {kind === "upcoming" ? (
        <>
          <p className={styles.field}>
            <label className={styles.label} htmlFor="n-booking-url">
              Booking link
            </label>
            <input
              id="n-booking-url"
              className={styles.input}
              type="url"
              name="bookingUrl"
              defaultValue={keep(state, "bookingUrl", item?.booking_url ?? "")}
              placeholder="https://…"
              {...fieldError(state, "bookingUrl").inputProps}
            />
            <span className={styles.hint}>
              Optional. Where people book a place — a ticket page, a
              registration form, anything with a web address. While the event is
              still to come, this becomes a “Book your place” button on the News
              &amp; Events page and in the announcement on the home page.
            </span>
            <FieldError state={state} name="bookingUrl" />
          </p>

          <SlotsFilledCheck
            defaultChecked={
              state.values
                ? state.values.slotsFilled === "on"
                : (item?.slots_filled ?? false)
            }
          />
        </>
      ) : null}

      <p className={styles.field}>
        <label className={styles.label} htmlFor="n-summary">
          Summary
        </label>
        <textarea
          id="n-summary"
          className={styles.textarea}
          name="summary"
          defaultValue={keep(state, "summary", item?.summary ?? "")}
          rows={3}
        />
      </p>

      <p className={styles.field}>
        <label className={styles.label} htmlFor="n-body">
          Detail
        </label>
        <textarea
          id="n-body"
          className={styles.textarea}
          name="body"
          defaultValue={keep(state, "body", item?.body ?? "")}
          rows={7}
        />
        <span className={styles.hint}>
          Plain text. Blank lines start a new paragraph.
        </span>
      </p>

      {/*
       * What happened, written afterwards.
       *
       * From the review meeting of 12 August 2026. An event used to disappear
       * from the public page when it finished; it now stays on as a past event,
       * which is only worth doing if there is somewhere to say how it went.
       *
       * Shown for both event kinds and never for a news post. It is offered
       * before the event has happened on purpose: an "already held" entry is
       * usually typed up weeks late, in one sitting, and an editor who has the
       * write-up in front of them should not be told to come back later. The
       * public page shows these only once the event is over.
       *
       * Photographs are not here because they already work — the picture
       * chooser above takes as many as the editor likes, on the day or a
       * fortnight afterwards.
       */}
      {isEventKind(kind) ? (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>After the event</h3>
          <p className={styles.hint}>
            Fill these in once the event has taken place. They stay hidden until
            it is over, so you can write them at any time. To add photographs,
            use the pictures above.
          </p>

          <p className={styles.field}>
            <label className={styles.label} htmlFor="n-event-outcome">
              How it went
            </label>
            <textarea
              id="n-event-outcome"
              className={styles.textarea}
              name="eventOutcome"
              defaultValue={keep(state, "eventOutcome", item?.event_outcome ?? "")}
              rows={5}
            />
            <span className={styles.hint}>
              Optional. What took place, who attended, what came out of it.
              Plain text; blank lines start a new paragraph.
            </span>
          </p>

          <p className={styles.field}>
            <label className={styles.label} htmlFor="n-event-video">
              Video or recording
            </label>
            <input
              id="n-event-video"
              className={styles.input}
              type="url"
              name="eventVideoUrl"
              defaultValue={keep(state, "eventVideoUrl", item?.event_video_url ?? "")}
              placeholder="https://…"
              {...fieldError(state, "eventVideoUrl").inputProps}
            />
            <span className={styles.hint}>
              Optional. A YouTube link, or any other page with the recording on
              it. It becomes a “Watch the recording” link once the event is over.
            </span>
            <FieldError state={state} name="eventVideoUrl" />
          </p>
        </div>
      ) : null}

      <ImagesField existing={item?.images ?? []} />

      {/*
       * Position within this entry's own list — the same control findings and
       * publications already have, so there is one way to arrange things in
       * this admin rather than two.
       *
       * The hint is explicit that it does not reach across the lists, because
       * "Order" on a page holding both news and events invites the reasonable
       * guess that setting a news post to 1 puts it at the top of the page.
       */}
      <div className={styles.row}>
        <p className={styles.field}>
          <label className={styles.label} htmlFor="n-order">
            Order
          </label>
          <input
            id="n-order"
            className={styles.input}
            type="number"
            name="sortOrder"
            defaultValue={keep(state, "sortOrder", String(item?.sort_order ?? 0))}
          />
          <span className={styles.hint}>
            Lower numbers first. Arranges entries within their own list — news
            among news, events among events — and never moves one list above the
            other. Leave everything at 0 for date order.
          </span>
        </p>

        <PublishCheck defaultChecked={item?.published ?? false} />
      </div>

      <p className={styles.actions}>
        <Submit />
      </p>
    </form>
  );
}
