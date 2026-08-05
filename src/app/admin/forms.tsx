"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "./actions";
import {
  saveFinding,
  saveNewsItem,
  savePublication,
  signIn,
} from "./actions";
import type { Finding, ImageSize, MediaRef, NewsItem, Publication } from "@/lib/repo";
import { ACCEPT_ATTRIBUTE, MAX_UPLOAD_BYTES } from "@/lib/upload-limits";
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

function Banner({ state }: { state: ActionState }) {
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
function ImagesField({
  existing,
  size,
}: {
  existing: MediaRef[];
  size: ImageSize;
}) {
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
   * Not a security control — `src/lib/upload.ts` re-checks every file on the
   * server, which is the check that counts. This exists so an editor who picks
   * a 12 MB photograph is told at once, instead of waiting for a whole upload
   * that was always going to be refused. Every file is checked, because one bad
   * file in a multiple selection would otherwise fail the entire save.
   */
  const onPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];
    const over = files.find((file) => file.size > MAX_UPLOAD_BYTES);

    if (over) {
      setTooBig(
        `“${over.name}” is ${(over.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB per image — please resize it and choose again.`,
      );
      event.target.value = "";
      setPicked([]);
      return;
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
      {picked.length > 0 ? (
        <span className={styles.hint}>
          {picked.length} new image{picked.length === 1 ? "" : "s"}: {picked.join(", ")}
        </span>
      ) : null}
      <span className={styles.hint}>
        PNG, JPEG, WebP or GIF, up to {MAX_UPLOAD_BYTES / 1024 / 1024} MB each.
        SVG is not accepted. Choose several at once if you want a gallery.
      </span>

      <label className={styles.label} htmlFor="newImageAlt">
        Description for the new images
      </label>
      <input
        id="newImageAlt"
        className={styles.input}
        name="newImageAlt"
        maxLength={300}
      />
      <span className={styles.hint}>
        Applied to everything added in this save. Each one can be described
        separately after saving.
      </span>

      <label className={styles.label} htmlFor="imageSize">
        How large should they appear?
      </label>
      <select
        id="imageSize"
        className={styles.select}
        name="imageSize"
        defaultValue={size}
      >
        <option value="small">Small — a thumbnail beside the text (about a quarter of the width)</option>
        <option value="medium">Medium — beside the text, about half the width</option>
        <option value="large">Large — the full width, with the text underneath</option>
      </select>
      <span className={styles.hint}>
        With more than one image they are laid out as a gallery at the chosen
        size. Each image keeps its own shape, so nothing is cropped or padded.
      </span>
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
        <label className={styles.label} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className={styles.input}
          type="email"
          name="email"
          autoComplete="username"
          required
        />
      </p>

      <p className={styles.field}>
        <label className={styles.label} htmlFor="password">
          Password
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
 * Finding
 * ----------------------------------------------------------------------- */

export function FindingForm({ finding }: { finding?: Finding }) {
  const [state, action] = useActionState(saveFinding, EMPTY);

  return (
    <form className={styles.form} action={action}>
      <Banner state={state} />
      {finding ? <input type="hidden" name="id" value={finding.id} /> : null}

      <p className={styles.field}>
        <label className={styles.label} htmlFor="f-title">
          Title
        </label>
        <input
          id="f-title"
          className={styles.input}
          name="title"
          defaultValue={finding?.title ?? ""}
          maxLength={300}
          required
        />
      </p>

      <p className={styles.field}>
        <label className={styles.label} htmlFor="f-summary">
          Summary
        </label>
        <textarea
          id="f-summary"
          className={styles.textarea}
          name="summary"
          defaultValue={finding?.summary ?? ""}
          rows={3}
        />
        <span className={styles.hint}>One or two sentences, shown in the list on /outputs.</span>
      </p>

      <p className={styles.field}>
        <label className={styles.label} htmlFor="f-body">
          Detail
        </label>
        <textarea
          id="f-body"
          className={styles.textarea}
          name="body"
          defaultValue={finding?.body ?? ""}
          rows={7}
        />
        <span className={styles.hint}>
          Plain text. Blank lines start a new paragraph; no HTML or Markdown is
          interpreted, so pasted formatting will show as characters.
        </span>
      </p>

      <ImagesField
        existing={finding?.images ?? []}
        size={finding?.image_size ?? "medium"}
      />

      <div className={styles.row}>
        <p className={styles.field}>
          <label className={styles.label} htmlFor="f-order">
            Order
          </label>
          <input
            id="f-order"
            className={styles.input}
            type="number"
            name="sortOrder"
            defaultValue={finding?.sort_order ?? 0}
          />
          <span className={styles.hint}>Lower numbers first.</span>
        </p>

        <PublishCheck defaultChecked={finding?.published ?? false} />
      </div>

      <p className={styles.actions}>
        <Submit />
      </p>
    </form>
  );
}

/* --------------------------------------------------------------------------
 * Publication
 * ----------------------------------------------------------------------- */

export function PublicationForm({ publication }: { publication?: Publication }) {
  const [state, action] = useActionState(savePublication, EMPTY);

  return (
    <form className={styles.form} action={action}>
      <Banner state={state} />
      {publication ? <input type="hidden" name="id" value={publication.id} /> : null}

      <p className={styles.field}>
        <label className={styles.label} htmlFor="p-title">
          Title
        </label>
        <input
          id="p-title"
          className={styles.input}
          name="title"
          defaultValue={publication?.title ?? ""}
          maxLength={400}
          required
        />
      </p>

      <p className={styles.field}>
        <label className={styles.label} htmlFor="p-authors">
          Authors
        </label>
        <input
          id="p-authors"
          className={styles.input}
          name="authors"
          defaultValue={publication?.authors ?? ""}
          maxLength={500}
        />
        <span className={styles.hint}>As they should appear, e.g. “Ó Broin, E., Smith, J.”</span>
      </p>

      <div className={styles.row}>
        <p className={styles.field}>
          <label className={styles.label} htmlFor="p-venue">
            Journal or conference
          </label>
          <input
            id="p-venue"
            className={styles.input}
            name="venue"
            defaultValue={publication?.venue ?? ""}
            maxLength={300}
          />
        </p>

        <p className={styles.field}>
          <label className={styles.label} htmlFor="p-year">
            Year
          </label>
          <input
            id="p-year"
            className={styles.input}
            type="number"
            name="year"
            defaultValue={publication?.year ?? ""}
            min={1900}
            max={2200}
          />
        </p>
      </div>

      <p className={styles.field}>
        <label className={styles.label} htmlFor="p-doi">
          DOI
        </label>
        <input
          id="p-doi"
          className={styles.input}
          name="doi"
          defaultValue={publication?.doi ?? ""}
          placeholder="10.1234/abcd"
        />
        <span className={styles.hint}>
          Paste the bare DOI or a full doi.org link — both are accepted and
          stored the same way, then shown as a link to doi.org.
        </span>
      </p>

      <p className={styles.field}>
        <label className={styles.label} htmlFor="p-url">
          Other link
        </label>
        <input
          id="p-url"
          className={styles.input}
          type="url"
          name="url"
          defaultValue={publication?.url ?? ""}
          placeholder="https://…"
        />
        <span className={styles.hint}>
          Optional. For a repository copy or a PDF when there is no DOI.
        </span>
      </p>

      <div className={styles.row}>
        <p className={styles.field}>
          <label className={styles.label} htmlFor="p-order">
            Order
          </label>
          <input
            id="p-order"
            className={styles.input}
            type="number"
            name="sortOrder"
            defaultValue={publication?.sort_order ?? 0}
          />
        </p>

        <PublishCheck defaultChecked={publication?.published ?? false} />
      </div>

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
  const [kind, setKind] = useState<"news" | "event">(item?.kind ?? "news");

  return (
    <form className={styles.form} action={action}>
      <Banner state={state} />
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className={styles.row}>
        <p className={styles.field}>
          <label className={styles.label} htmlFor="n-kind">
            Type
          </label>
          <select
            id="n-kind"
            className={styles.select}
            name="kind"
            value={kind}
            onChange={(event) => setKind(event.target.value as "news" | "event")}
          >
            <option value="news">News</option>
            <option value="event">Event</option>
          </select>
        </p>

        <p className={styles.field}>
          <label className={styles.label} htmlFor="n-published-on">
            Date posted
          </label>
          <input
            id="n-published-on"
            className={styles.input}
            type="date"
            name="publishedOn"
            defaultValue={item?.published_on ?? new Date().toISOString().slice(0, 10)}
          />
        </p>
      </div>

      <p className={styles.field}>
        <label className={styles.label} htmlFor="n-title">
          Title
        </label>
        <input
          id="n-title"
          className={styles.input}
          name="title"
          defaultValue={item?.title ?? ""}
          maxLength={300}
          required
        />
      </p>

      {kind === "event" ? (
        <div className={styles.row}>
          <p className={styles.field}>
            <label className={styles.label} htmlFor="n-event-date">
              Event date
            </label>
            <input
              id="n-event-date"
              className={styles.input}
              type="date"
              name="eventDate"
              defaultValue={item?.event_date ?? ""}
              required
            />
          </p>

          <p className={styles.field}>
            <label className={styles.label} htmlFor="n-location">
              Location
            </label>
            <input
              id="n-location"
              className={styles.input}
              name="location"
              defaultValue={item?.location ?? ""}
              maxLength={200}
            />
          </p>
        </div>
      ) : null}

      <p className={styles.field}>
        <label className={styles.label} htmlFor="n-summary">
          Summary
        </label>
        <textarea
          id="n-summary"
          className={styles.textarea}
          name="summary"
          defaultValue={item?.summary ?? ""}
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
          defaultValue={item?.body ?? ""}
          rows={7}
        />
        <span className={styles.hint}>
          Plain text. Blank lines start a new paragraph.
        </span>
      </p>

      <ImagesField existing={item?.images ?? []} size={item?.image_size ?? "medium"} />

      <PublishCheck defaultChecked={item?.published ?? false} />

      <p className={styles.actions}>
        <Submit />
      </p>
    </form>
  );
}
