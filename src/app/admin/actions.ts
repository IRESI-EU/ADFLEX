"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import {
  SESSION_COOKIE,
  clearAttempts,
  createSessionToken,
  getCurrentUser,
  recordFailedAttempt,
  tooManyAttempts,
  verifyPassword,
} from "@/lib/auth";
import { queryOne, withTransaction } from "@/lib/db";
import { readDocuments, readUploads } from "@/lib/upload";
import {
  createFile,
  createFinding,
  createMedia,
  createNewsItem,
  createPublication,
  deleteFinding,
  deleteMessage,
  deleteNewsItem,
  deletePublication,
  markMessageRead,
  normaliseDoi,
  type NewsKind,
  setFileLabel,
  setMediaAlt,
  setPublished,
  setSlotsFilled,
  toImageSize,
  updateFinding,
  updateNewsItem,
  updatePublication,
} from "@/lib/repo";

/**
 * Every mutation in the admin.
 *
 * ---------------------------------------------------------------------------
 * EVERY ACTION RE-CHECKS THE SESSION. THIS IS NOT DUPLICATION.
 * ---------------------------------------------------------------------------
 * Server Actions compile to POST endpoints that are reachable directly, without
 * ever loading the page that renders the form. `src/proxy.ts` redirecting
 * signed-out visitors away from `/admin` therefore protects the *pages* and
 * protects none of this. `requireEditor()` below is the actual security
 * boundary, and it is the first line of every exported action.
 *
 * State is driven by `useActionState`, so a failed save re-renders with a
 * message instead of throwing away what was typed — see `ActionState`.
 */

export type ActionState = {
  error?: string;
  ok?: string;
  /**
   * Which field the error belongs to, so the form can flag that one input
   * rather than only showing a banner at the top.
   */
  field?: string;
  /**
   * Everything that was submitted, echoed back.
   *
   * A Server Action re-renders the form from scratch, so without this every
   * other field would fall back to its `defaultValue` and a single bad DOI
   * would wipe a long body the editor had just typed. The offending field is
   * deliberately *not* included, so it comes back empty and ready to retype.
   *
   * Text fields only. File inputs cannot be repopulated from the server — a
   * browser will not let a page set the value of a file input — so a failed
   * save still needs the images choosing again, and the forms say so.
   */
  values?: Record<string, string>;
};

/**
 * Every text field the editor typed, minus the one that failed.
 *
 * `id` is carried too, so a failed edit stays an edit rather than silently
 * becoming a new entry on the next attempt.
 */
function keepValues(form: FormData, exceptField?: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value !== "string") continue;
    // Next's own action bookkeeping, and the field being cleared.
    if (key.startsWith("$ACTION") || key === exceptField) continue;
    values[key] = value;
  }
  return values;
}

/**
 * A validation failure attributable to one field.
 *
 * The message always ends by saying the field has been emptied. The form clears
 * it so the thing to retype is obvious, and an editor who is not told that has
 * to work out for themselves whether their text was rejected or simply lost.
 */
function invalid(form: FormData, field: string, error: string): ActionState {
  return {
    error: `${error} That field has been cleared — please enter it again. Everything else you typed has been kept.`,
    field,
    values: keepValues(form, field),
  };
}

/** A failure that belongs to the form as a whole, so nothing is cleared. */
function failed(form: FormData, error: string): ActionState {
  return { error, values: keepValues(form) };
}

async function requireEditor() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/* --------------------------------------------------------------------------
 * Field helpers
 * ----------------------------------------------------------------------- */

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const flag = (form: FormData, key: string) => form.get(key) === "on";
const int = (form: FormData, key: string, fallback = 0) => {
  const value = Number(text(form, key));
  return Number.isFinite(value) ? Math.trunc(value) : fallback;
};

/** `YYYY-MM-DD`, or null. Anything else is rejected rather than handed to Postgres. */
const date = (form: FormData, key: string): string | null => {
  const value = text(form, key);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
};

/**
 * `HH:MM` on a 24-hour clock, or null when the field was left empty.
 *
 * `HH:MM:SS` is accepted because a browser sends seconds when the input carries
 * a step; they are dropped rather than stored, since nobody schedules a seminar
 * for 14:30:07.
 *
 * Returns `undefined` — distinct from null — for anything else, so the caller
 * can report it. An optional field that quietly discards what it could not
 * understand is worse than a required one: the entry saves, looks fine, and is
 * missing the time nobody notices until someone turns up at the wrong hour.
 */
const time = (form: FormData, key: string): string | null | undefined => {
  const value = text(form, key);
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value);
  if (!match) return undefined;
  const [, hours, minutes] = match;
  if (Number(hours) > 23 || Number(minutes) > 59) return undefined;
  return `${hours.padStart(2, "0")}:${minutes}`;
};

/**
 * Works out the final, ordered set of images for an entry.
 *
 * Three inputs are combined, in this order:
 *
 *  1. `keepImage` — the ids already attached, in the order the form listed
 *     them. Unticking one drops it; the field order is the display order.
 *  2. `imageAlt:<id>` — updated alt text for any kept image, saved in place.
 *  3. `images` — newly chosen files, appended after the kept ones.
 *
 * Throws with a readable message on a bad file, so the caller can show it
 * rather than the save failing silently.
 */
async function resolveImages(form: FormData, userId: number): Promise<number[]> {
  const kept = form
    .getAll("keepImage")
    .map((value) => Number(value))
    .filter((id) => Number.isInteger(id) && id > 0);

  for (const id of kept) {
    const alt = text(form, `imageAlt:${id}`);
    await setMediaAlt(id, alt);
  }

  // `getAll` on a multiple file input returns every chosen file. An untouched
  // input still yields one empty `File`, which `readUploads` skips.
  const files = form.getAll("images").filter((v): v is File => v instanceof File);
  const uploaded = await readUploads(files);
  if (!uploaded.ok) throw new Error(uploaded.error);

  /*
   * A description per newly chosen image, matched by position.
   *
   * The form renders one `newImageAlt:<n>` input for each file the editor
   * picked, in the order the file input reported them, and `form.getAll` here
   * preserves that same order — so index n is the description for file n. Each
   * is optional; an empty one means "decorative", exactly as before.
   *
   * `newImageAlt` without an index is still read as a fallback for all of them,
   * which is what a browser with JavaScript off will send.
   */
  const sharedAlt = text(form, "newImageAlt");
  const created: number[] = [];
  for (const [index, upload] of uploaded.uploads.entries()) {
    const perImage = text(form, `newImageAlt:${index}`);
    created.push(
      await createMedia({
        filename: upload.filename,
        mime: upload.mime,
        data: upload.data,
        alt: perImage || sharedAlt,
        width: upload.width,
        height: upload.height,
        uploadedBy: userId,
      }),
    );
  }

  return [...kept, ...created];
}

/**
 * Works out the final, ordered set of attached documents.
 *
 * The same shape as `resolveImages`: `keepFile` carries the ids already
 * attached in display order, `fileLabel:<id>` updates a kept file's link text,
 * and `files` holds anything newly chosen, appended after them.
 */
async function resolveFiles(form: FormData, userId: number): Promise<number[]> {
  const kept = form
    .getAll("keepFile")
    .map((value) => Number(value))
    .filter((id) => Number.isInteger(id) && id > 0);

  for (const id of kept) {
    await setFileLabel(id, text(form, `fileLabel:${id}`));
  }

  const chosen = form.getAll("files").filter((v): v is File => v instanceof File);
  const read = await readDocuments(chosen);
  if (!read.ok) throw new Error(read.error);

  const created: number[] = [];
  for (const [index, document] of read.documents.entries()) {
    created.push(
      await createFile({
        filename: document.filename,
        mime: document.mime,
        data: document.data,
        label: text(form, `newFileLabel:${index}`),
        uploadedBy: userId,
      }),
    );
  }

  return [...kept, ...created];
}

/**
 * The one size every entry's images are drawn at.
 *
 * The admin used to offer small, medium and large. The client asked on
 * 6 August 2026 for a single size, and medium — images beside the text at about
 * half the width — is the one that suits an editorial page. The column and the
 * three-way `ImageSize` type stay, because rows saved before this may hold
 * `small` or `large` and the public gallery still renders them correctly; only
 * the *choice* has gone. Re-offering it means putting the select back in
 * `ImagesField` and reading it here again.
 */
const IMAGE_SIZE = toImageSize("medium");

/**
 * Refreshes both the admin list and the public page an edit affects.
 *
 * News and event changes also revalidate `/`, which is easy to miss: the home
 * page is statically generated, and it announces the next upcoming event.
 * Without `/` in that list a newly published event was queried once at build
 * time and never again, so the announcement only appeared after the next
 * deploy — the entry was live on `/news` and invisible on the home page.
 */
function revalidate(...paths: string[]) {
  for (const path of paths) revalidatePath(path);
}

/* --------------------------------------------------------------------------
 * Sign in and out
 * ----------------------------------------------------------------------- */

export async function signIn(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const username = text(form, "username").toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!username || !password) return { error: "Enter your username and password." };

  /*
   * Counted against the account, the IP and the pair, independently — see
   * `tooManyAttempts`. The single combined key this used to build could be
   * sidestepped by varying either half.
   */
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  if (tooManyAttempts(ip, username)) {
    return { error: "Too many attempts. Wait fifteen minutes and try again." };
  }

  let row: { id: number; password_hash: string; session_version: number } | null = null;
  try {
    row = await queryOne<{ id: number; password_hash: string; session_version: number }>(
      "SELECT id, password_hash, session_version FROM admin_users WHERE username = $1",
      [username],
    );
  } catch (error) {
    console.error("[adflex] sign-in lookup failed:", error);
    return {
      error:
        "Cannot reach the database. Check DATABASE_URL and that the database is running — see docs/ADMIN.md.",
    };
  }

  // Verify against a dummy hash when the account does not exist, so a missing
  // unknown account and a wrong password take the same time. Skipping the work here is
  // how a login endpoint tells an attacker which addresses are real.
  const ok = row
    ? await verifyPassword(password, row.password_hash)
    : await verifyPassword(password, `scrypt$${"0".repeat(32)}$${"0".repeat(128)}`);

  if (!row || !ok) {
    recordFailedAttempt(ip, username);
    return { error: "That username and password do not match an account." };
  }

  clearAttempts(ip, username);

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(row.id, row.session_version), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 60 * 60,
  });

  redirect("/admin");
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* --------------------------------------------------------------------------
 * Findings
 * ----------------------------------------------------------------------- */

/**
 * The one action behind the Outcomes form.
 *
 * `/outcomes` publishes two different things — project findings and
 * publications — and the admin now offers them through a single form with a
 * type selector, the same way News & Events does. This dispatches on that
 * selector.
 *
 * They stay two tables, because they are genuinely different records: a finding
 * has a body and images, a publication has authors, a venue and a DOI. The
 * selector is therefore fixed once an entry exists — you cannot turn a saved
 * finding into a publication, and the form disables the control when editing
 * rather than pretending otherwise.
 */
export async function saveOutcome(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  return text(form, "kind") === "publication"
    ? savePublication(form)
    : saveFinding(form);
}

async function saveFinding(form: FormData): Promise<ActionState> {
  const user = await requireEditor();

  const title = text(form, "title");
  if (!title) return invalid(form, "title", "A finding needs a title.");

  const id = int(form, "id", 0);

  /*
   * The uploads and the save are one transaction.
   *
   * `resolveImages` and `resolveFiles` insert rows before the entry itself
   * exists, so a failure after them used to leave the media behind and hand the
   * editor an error — the database changed, the save did not happen, and nothing
   * said so. Inside `withTransaction` the whole thing lands or none of it does.
   */
  try {
    await withTransaction(async () => {
      const input = {
        title,
        summary: text(form, "summary"),
        body: text(form, "body"),
        imageIds: await resolveImages(form, user.id),
        fileIds: await resolveFiles(form, user.id),
        imageSize: IMAGE_SIZE,
        published: flag(form, "published"),
        sortOrder: int(form, "sortOrder"),
      };

      if (id > 0) await updateFinding(id, input);
      else await createFinding(input);
    });
  } catch (error) {
    return failed(
      form,
      error instanceof Error ? error.message : "Could not save that finding.",
    );
  }

  revalidate("/admin/outcomes", "/outcomes");
  redirect("/admin/outcomes?saved=finding");
}

export async function removeFinding(form: FormData): Promise<void> {
  await requireEditor();
  await deleteFinding(int(form, "id"));
  revalidate("/admin/outcomes", "/outcomes");
}

/**
 * Publishes or unpublishes without opening the editor.
 *
 * The desired state is sent explicitly rather than flipped from whatever is in
 * the database. Toggling from a stale page — two tabs open, or a browser back —
 * would act on what the editor saw rather than what they asked for, which is
 * the wrong way round for the one control that decides whether something is
 * publicly visible.
 */
export async function setFindingPublished(form: FormData): Promise<void> {
  await requireEditor();
  await setPublished("findings", int(form, "id"), form.get("publish") === "1");
  revalidate("/admin/outcomes", "/outcomes", "/admin");
}

/* --------------------------------------------------------------------------
 * Publications
 * ----------------------------------------------------------------------- */

async function savePublication(form: FormData): Promise<ActionState> {
  const user = await requireEditor();

  const title = text(form, "title");
  if (!title) return invalid(form, "title", "A publication needs a title.");

  /*
   * The link is the ordinary way to point at a publication, and the DOI is an
   * extra. Both are optional: a paper can be listed before it is online, and
   * plenty of outputs — a report, a deliverable, a conference talk — have a URL
   * and no DOI at all. Nothing here refuses a publication that has neither.
   */
  const rawUrl = text(form, "url");
  if (rawUrl && !/^https?:\/\//i.test(rawUrl)) {
    return invalid(form, "url", "The link must start with http:// or https://");
  }

  const rawDoi = text(form, "doi");
  const doi = rawDoi ? normaliseDoi(rawDoi) : null;
  if (rawDoi && !doi) {
    return invalid(
      form,
      "doi",
      "That does not look like a DOI. Expected something like 10.1234/abcd — a full doi.org link is fine too. Leave it empty if the publication has no DOI.",
    );
  }

  const rawYear = text(form, "year");
  const year = rawYear ? int(form, "year") : null;
  if (year !== null && (year < 1900 || year > 2200)) {
    return invalid(form, "year", "That year does not look right.");
  }

  const id = int(form, "id", 0);

  // One transaction, for the same reason as findings above.
  try {
    await withTransaction(async () => {
      const input = {
        title,
        authors: text(form, "authors"),
        venue: text(form, "venue"),
        year,
        doi,
        url: rawUrl || null,
        fileIds: await resolveFiles(form, user.id),
        published: flag(form, "published"),
        sortOrder: int(form, "sortOrder"),
      };

      if (id > 0) await updatePublication(id, input);
      else await createPublication(input);
    });
  } catch (error) {
    return failed(
      form,
      error instanceof Error ? error.message : "Could not save that publication.",
    );
  }

  revalidate("/admin/outcomes", "/outcomes");
  redirect("/admin/outcomes?saved=publication");
}

export async function removePublication(form: FormData): Promise<void> {
  await requireEditor();
  await deletePublication(int(form, "id"));
  revalidate("/admin/outcomes", "/outcomes");
}

export async function setPublicationPublished(form: FormData): Promise<void> {
  await requireEditor();
  await setPublished("publications", int(form, "id"), form.get("publish") === "1");
  revalidate("/admin/outcomes", "/outcomes", "/admin");
}

/* --------------------------------------------------------------------------
 * News and events
 * ----------------------------------------------------------------------- */

export async function saveNewsItem(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const user = await requireEditor();

  const title = text(form, "title");
  if (!title) return invalid(form, "title", "An entry needs a title.");

  /*
   * Three kinds since 8 August 2026: a news post, an event already held, and an
   * upcoming one. Anything unrecognised falls back to "news", which is the kind
   * with no extra fields and so the safe default.
   */
  const raw = text(form, "kind");
  const kind: NewsKind = raw === "event" || raw === "upcoming" ? raw : "news";
  const isEventKind = kind === "event" || kind === "upcoming";
  /*
   * An event's date is the date it happens, which only the editor knows, so it
   * stays a field and stays required for events. That is a different thing from
   * the posting date, which is now set automatically — see `NewsInput`.
   */
  const eventDate = date(form, "eventDate");
  if (isEventKind && !eventDate) {
    return invalid(form, "eventDate", "An event needs a date.");
  }

  /*
   * Times, and who has to give them.
   *
   * An **upcoming** event needs both: the start, because people are being asked
   * to turn up, and the end, because that is the moment the entry drops off the
   * public page. Without an end time an event would have to be taken down by
   * hand, which is the thing nobody remembers to do.
   *
   * An event **already held** needs neither. It is a record of something that
   * happened, and a record with no hour written down is still a record — the
   * project has events going back before anyone was logging times.
   */
  const eventTime = isEventKind ? time(form, "eventTime") : null;
  if (eventTime === undefined) {
    return invalid(form, "eventTime", "The time must be given as HH:MM, for example 14:30.");
  }
  if (kind === "upcoming" && !eventTime) {
    return invalid(form, "eventTime", "An upcoming event needs a start time.");
  }

  const eventEndTime = isEventKind ? time(form, "eventEndTime") : null;
  if (eventEndTime === undefined) {
    return invalid(form, "eventEndTime", "The end time must be given as HH:MM, for example 16:00.");
  }
  if (kind === "upcoming" && !eventEndTime) {
    return invalid(form, "eventEndTime", "An upcoming event needs an end time — it is when the event becomes a past event.");
  }

  /*
   * Compared as `HH:MM` strings, which sort correctly on a 24-hour clock.
   *
   * An event that finishes after midnight cannot be expressed: the end time
   * belongs to the same day as the start, and a bare TIME has no day in it. That
   * is a real limit, and rejecting it plainly is better than accepting 23:00 to
   * 01:00 and quietly treating the entry as already over.
   */
  if (eventTime && eventEndTime && eventEndTime <= eventTime) {
    return invalid(
      form,
      "eventEndTime",
      "The end time must be after the start time, on the same day.",
    );
  }

  // Only meaningful for an event, and checked the same way as a publication's
  // link so a typo cannot become a button that goes nowhere.
  // Booking belongs to an upcoming event only — an event already held has
  // nothing to book, so the field is neither shown nor read for it.
  const rawBookingUrl = kind === "upcoming" ? text(form, "bookingUrl") : "";
  if (rawBookingUrl && !/^https?:\/\//i.test(rawBookingUrl)) {
    return invalid(form, "bookingUrl", "The booking link must start with http:// or https://");
  }

  /*
   * What happened at the event, filled in afterwards.
   *
   * Read for both event kinds, not only for one that has already passed. An
   * editor adding an event weeks late — which is how "already held" entries
   * usually arrive — writes the announcement and the write-up in the same
   * sitting, and a field that refused to save until the clock caught up would
   * throw that work away. The public page decides when to *show* it.
   */
  const eventOutcome = isEventKind ? text(form, "eventOutcome") : "";

  const rawVideoUrl = isEventKind ? text(form, "eventVideoUrl") : "";
  if (rawVideoUrl && !/^https?:\/\//i.test(rawVideoUrl)) {
    return invalid(form, "eventVideoUrl", "The video link must start with http:// or https://");
  }

  const id = int(form, "id", 0);

  // One transaction, for the same reason as findings above.
  try {
    await withTransaction(async () => {
      const input = {
        kind,
        title,
        summary: text(form, "summary"),
        body: text(form, "body"),
        imageIds: await resolveImages(form, user.id),
        imageSize: IMAGE_SIZE,
        eventDate: isEventKind ? eventDate : null,
        eventTime,
        eventEndTime,
        location: isEventKind ? text(form, "location") || null : null,
        bookingUrl: rawBookingUrl || null,
        slotsFilled: kind === "upcoming" && flag(form, "slotsFilled"),
        published: flag(form, "published"),
        sortOrder: int(form, "sortOrder"),
        eventOutcome,
        eventVideoUrl: rawVideoUrl || null,
      };

      if (id > 0) await updateNewsItem(id, input);
      else await createNewsItem(input);
    });
  } catch (error) {
    return failed(
      form,
      error instanceof Error ? error.message : "Could not save that entry.",
    );
  }

  revalidate("/admin/news", "/news", "/");
  redirect("/admin/news?saved=1");
}

export async function removeNewsItem(form: FormData): Promise<void> {
  await requireEditor();
  await deleteNewsItem(int(form, "id"));
  revalidate("/admin/news", "/news", "/");
}

/**
 * Marks an upcoming event full, or not, without opening the editor.
 *
 * The same shape as `setNewsPublished`: the desired state is sent in the form
 * rather than flipped from whatever is in the database, so the button does what
 * its label says even if the page it was clicked from is a little stale.
 *
 * Scoped to `kind = 'upcoming'` in the SQL, not just in the UI. This is a POST
 * endpoint reachable directly, so "only upcoming events can be marked full" has
 * to be enforced where it cannot be skipped.
 */
export async function setNewsSlotsFilled(form: FormData): Promise<void> {
  await requireEditor();
  await setSlotsFilled(int(form, "id"), form.get("filled") === "1");
  revalidate("/admin/news", "/news", "/");
}

export async function setNewsPublished(form: FormData): Promise<void> {
  await requireEditor();
  await setPublished("news_items", int(form, "id"), form.get("publish") === "1");
  revalidate("/admin/news", "/news", "/admin", "/");
}

/* --------------------------------------------------------------------------
 * Messages
 * ----------------------------------------------------------------------- */

export async function markRead(form: FormData): Promise<void> {
  await requireEditor();
  await markMessageRead(int(form, "id"));
  revalidate("/admin/messages", "/admin");
}

export async function removeMessage(form: FormData): Promise<void> {
  await requireEditor();
  await deleteMessage(int(form, "id"));
  revalidate("/admin/messages", "/admin");
}
