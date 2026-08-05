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
import { queryOne } from "@/lib/db";
import { readUploads } from "@/lib/upload";
import {
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
  setMediaAlt,
  setPublished,
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
 * State shape is `{ error?: string; ok?: string }`, driven by `useActionState`
 * so a failed save re-renders with a message instead of throwing away what was
 * typed.
 */

export type ActionState = { error?: string; ok?: string };

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

  const newAlt = text(form, "newImageAlt");
  const created: number[] = [];
  for (const upload of uploaded.uploads) {
    created.push(
      await createMedia({
        filename: upload.filename,
        mime: upload.mime,
        data: upload.data,
        alt: newAlt,
        width: upload.width,
        height: upload.height,
        uploadedBy: userId,
      }),
    );
  }

  return [...kept, ...created];
}

const imageSize = (form: FormData) => toImageSize(text(form, "imageSize"));

/** Refreshes both the admin list and the public page an edit affects. */
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
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password." };

  // Throttle on IP as well as email, so guessing one account from many
  // addresses and many accounts from one address are both slowed.
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `${ip}:${email}`;

  if (tooManyAttempts(key)) {
    return { error: "Too many attempts. Wait fifteen minutes and try again." };
  }

  let row: { id: number; password_hash: string } | null = null;
  try {
    row = await queryOne<{ id: number; password_hash: string }>(
      "SELECT id, password_hash FROM admin_users WHERE email = $1",
      [email],
    );
  } catch (error) {
    console.error("[adflex] sign-in lookup failed:", error);
    return {
      error:
        "Cannot reach the database. Check DATABASE_URL and that the database is running — see docs/ADMIN.md.",
    };
  }

  // Verify against a dummy hash when the account does not exist, so a missing
  // email and a wrong password take the same time. Skipping the work here is
  // how a login endpoint tells an attacker which addresses are real.
  const ok = row
    ? await verifyPassword(password, row.password_hash)
    : await verifyPassword(password, `scrypt$${"0".repeat(32)}$${"0".repeat(128)}`);

  if (!row || !ok) {
    recordFailedAttempt(key);
    return { error: "That email and password do not match an account." };
  }

  clearAttempts(key);

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(row.id), {
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

export async function saveFinding(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const user = await requireEditor();

  const title = text(form, "title");
  if (!title) return { error: "A finding needs a title." };

  const id = int(form, "id", 0);

  try {
    const input = {
      title,
      summary: text(form, "summary"),
      body: text(form, "body"),
      imageIds: await resolveImages(form, user.id),
      imageSize: imageSize(form),
      published: flag(form, "published"),
      sortOrder: int(form, "sortOrder"),
    };

    if (id > 0) await updateFinding(id, input);
    else await createFinding(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save that finding." };
  }

  revalidate("/admin/outputs", "/outputs");
  redirect("/admin/outputs?saved=finding");
}

export async function removeFinding(form: FormData): Promise<void> {
  await requireEditor();
  await deleteFinding(int(form, "id"));
  revalidate("/admin/outputs", "/outputs");
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
  revalidate("/admin/outputs", "/outputs", "/admin");
}

/* --------------------------------------------------------------------------
 * Publications
 * ----------------------------------------------------------------------- */

export async function savePublication(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireEditor();

  const title = text(form, "title");
  if (!title) return { error: "A publication needs a title." };

  const rawDoi = text(form, "doi");
  const doi = rawDoi ? normaliseDoi(rawDoi) : null;
  if (rawDoi && !doi) {
    return {
      error:
        "That does not look like a DOI. Expected something like 10.1234/abcd — a full doi.org link is fine too.",
    };
  }

  const rawUrl = text(form, "url");
  if (rawUrl && !/^https?:\/\//i.test(rawUrl)) {
    return { error: "The link must start with http:// or https://" };
  }

  const rawYear = text(form, "year");
  const year = rawYear ? int(form, "year") : null;
  if (year !== null && (year < 1900 || year > 2200)) {
    return { error: "That year does not look right." };
  }

  const id = int(form, "id", 0);
  const input = {
    title,
    authors: text(form, "authors"),
    venue: text(form, "venue"),
    year,
    doi,
    url: rawUrl || null,
    published: flag(form, "published"),
    sortOrder: int(form, "sortOrder"),
  };

  try {
    if (id > 0) await updatePublication(id, input);
    else await createPublication(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save that publication." };
  }

  revalidate("/admin/outputs", "/outputs");
  redirect("/admin/outputs?saved=publication");
}

export async function removePublication(form: FormData): Promise<void> {
  await requireEditor();
  await deletePublication(int(form, "id"));
  revalidate("/admin/outputs", "/outputs");
}

export async function setPublicationPublished(form: FormData): Promise<void> {
  await requireEditor();
  await setPublished("publications", int(form, "id"), form.get("publish") === "1");
  revalidate("/admin/outputs", "/outputs", "/admin");
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
  if (!title) return { error: "An entry needs a title." };

  const kind = text(form, "kind") === "event" ? "event" : "news";
  const eventDate = date(form, "eventDate");
  if (kind === "event" && !eventDate) {
    return { error: "An event needs a date." };
  }

  const id = int(form, "id", 0);

  try {
    const input = {
      kind: kind as "news" | "event",
      title,
      summary: text(form, "summary"),
      body: text(form, "body"),
      imageIds: await resolveImages(form, user.id),
      imageSize: imageSize(form),
      publishedOn: date(form, "publishedOn") ?? new Date().toISOString().slice(0, 10),
      eventDate: kind === "event" ? eventDate : null,
      location: kind === "event" ? text(form, "location") || null : null,
      published: flag(form, "published"),
    };

    if (id > 0) await updateNewsItem(id, input);
    else await createNewsItem(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save that entry." };
  }

  revalidate("/admin/news", "/news");
  redirect("/admin/news?saved=1");
}

export async function removeNewsItem(form: FormData): Promise<void> {
  await requireEditor();
  await deleteNewsItem(int(form, "id"));
  revalidate("/admin/news", "/news");
}

export async function setNewsPublished(form: FormData): Promise<void> {
  await requireEditor();
  await setPublished("news_items", int(form, "id"), form.get("publish") === "1");
  revalidate("/admin/news", "/news", "/admin");
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
