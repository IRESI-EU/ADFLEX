"use server";

import { isDatabaseConfigured } from "@/lib/db";
import { createMessage } from "@/lib/repo";

/**
 * Receives a contact form submission.
 *
 * Public and unauthenticated by definition, so it is the one Server Action on
 * the site an anonymous visitor can reach. Three consequences, each handled
 * below: everything is length-capped before it reaches the database, a honeypot
 * catches the simplest bots, and nothing the sender typed is ever echoed back
 * into HTML by this action.
 *
 * **This stores personal data.** Name, email and free text, with Maynooth
 * University as the controller named in the privacy policy. See docs/ADMIN.md.
 */

export type ContactState = { error?: string; sent?: boolean };

const LIMITS = { name: 120, email: 200, subject: 200, message: 4000 };

export async function submitContact(
  _previous: ContactState,
  form: FormData,
): Promise<ContactState> {
  // Honeypot. A real person never sees or fills this field; automated posters
  // fill everything. Answer as though it succeeded — telling a bot it was
  // detected only teaches it to try again differently.
  if (String(form.get("website") ?? "").trim()) return { sent: true };

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const subject = String(form.get("subject") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { error: "Please fill in your name, your email address and a message." };
  }

  // Deliberately loose. Anything stricter rejects real addresses, and the only
  // real test of an address is sending to it.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "That email address does not look right." };
  }

  if (
    name.length > LIMITS.name ||
    email.length > LIMITS.email ||
    subject.length > LIMITS.subject ||
    message.length > LIMITS.message
  ) {
    return { error: "That message is longer than the form accepts. Please shorten it." };
  }

  if (!isDatabaseConfigured()) {
    // The form only renders when the database is configured, so reaching this
    // means a direct POST. Say plainly that nothing was stored rather than
    // showing a success message over a lost message.
    return { error: "The contact form is not available right now. Please email us instead." };
  }

  try {
    await createMessage({ name, email, subject, message });
  } catch (error) {
    console.error("[adflex] contact submission failed:", error);
    return {
      error: "Sorry — we could not save your message. Please email us instead.",
    };
  }

  return { sent: true };
}
