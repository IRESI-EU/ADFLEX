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
import type { Finding, NewsItem, Publication } from "@/lib/repo";
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
 * The image field, shared by findings and news.
 *
 * Shows what is already attached, offers to replace or remove it, and carries
 * the existing id forward in a hidden input so a save that does not touch the
 * picture keeps it.
 */
function ImageField({
  existingId,
  existingAlt,
}: {
  existingId: number | null;
  existingAlt: string | null;
}) {
  const [remove, setRemove] = useState(false);
  const [tooBig, setTooBig] = useState<string | null>(null);

  /**
   * Checks the size before the form is ever submitted.
   *
   * Not a security control — `src/lib/upload.ts` re-checks on the server, which
   * is the check that counts. This exists so an editor who picks a 12 MB
   * photograph is told immediately, instead of waiting for a full upload that
   * was always going to be refused.
   */
  const onPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size > MAX_UPLOAD_BYTES) {
      setTooBig(
        `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB — please resize it and choose it again.`,
      );
      event.target.value = "";
      return;
    }
    setTooBig(null);
  };

  return (
    <div className={styles.field}>
      <span className={styles.label}>Image</span>
      <input type="hidden" name="existingImageId" value={existingId ?? ""} />

      {existingId ? (
        <div className={styles.actions}>
          {/* eslint-disable-next-line @next/next/no-img-element -- served from
              the database at /media/[id]; next/image needs intrinsic dimensions
              we deliberately do not store. */}
          <img
            className={styles.thumb}
            src={`/media/${existingId}`}
            alt={existingAlt || ""}
            width={84}
          />
          <label className={styles.check}>
            <input
              type="checkbox"
              name="removeImage"
              checked={remove}
              onChange={(event) => setRemove(event.target.checked)}
            />
            Remove this image
          </label>
        </div>
      ) : null}

      <input
        className={styles.input}
        type="file"
        name="image"
        accept={ACCEPT_ATTRIBUTE}
        disabled={remove}
        onChange={onPick}
      />
      {tooBig ? (
        <span className={styles.error} role="alert">
          {tooBig}
        </span>
      ) : null}
      <span className={styles.hint}>
        PNG, JPEG, WebP or GIF, up to {MAX_UPLOAD_BYTES / 1024 / 1024} MB. SVG is
        not accepted. Leave empty to keep the current image.
      </span>

      <label className={styles.label} htmlFor="imageAlt">
        Image description
      </label>
      <input
        id="imageAlt"
        className={styles.input}
        type="text"
        name="imageAlt"
        defaultValue={existingAlt ?? ""}
        maxLength={300}
      />
      <span className={styles.hint}>
        What the image shows, for anyone using a screen reader. Leave empty if it
        is purely decorative.
      </span>
    </div>
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

      <ImageField
        existingId={finding?.image_id ?? null}
        existingAlt={finding?.image_alt ?? null}
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

        <label className={styles.check}>
          <input
            type="checkbox"
            name="published"
            defaultChecked={finding?.published ?? false}
          />
          Published — visible on the public site
        </label>
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

        <label className={styles.check}>
          <input
            type="checkbox"
            name="published"
            defaultChecked={publication?.published ?? false}
          />
          Published — visible on the public site
        </label>
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

      <ImageField
        existingId={item?.image_id ?? null}
        existingAlt={item?.image_alt ?? null}
      />

      <label className={styles.check}>
        <input type="checkbox" name="published" defaultChecked={item?.published ?? false} />
        Published — visible on the public site
      </label>

      <p className={styles.actions}>
        <Submit />
      </p>
    </form>
  );
}
