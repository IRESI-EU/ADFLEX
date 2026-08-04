import "server-only";

import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { queryOne } from "./db";

const scrypt = promisify(scryptCallback) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;

export const SESSION_COOKIE = "adflex_admin";

/** Eight hours. Long enough for a working day, short enough to matter. */
const SESSION_TTL_SECONDS = 8 * 60 * 60;

const SCRYPT_KEYLEN = 64;

export type AdminUser = {
  id: number;
  email: string;
  name: string;
};

/* --------------------------------------------------------------------------
 * Passwords
 * ----------------------------------------------------------------------- */

/**
 * Hashes with scrypt from `node:crypto` — no bcrypt or argon2 dependency.
 *
 * scrypt is memory-hard and is in Node's standard library, which is the whole
 * reason it is used here: the alternative is a native module that has to
 * compile on every deploy target. Stored as `scrypt$<salt hex>$<hash hex>` so
 * the format is self-describing if it ever needs to change.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

/**
 * Verifies a password against a stored hash.
 *
 * Compared with `timingSafeEqual`, not `===`. A byte-by-byte string comparison
 * returns faster on an early mismatch, and that timing difference is a usable
 * signal. Returns false rather than throwing on a malformed stored value, so a
 * corrupt row locks one account out instead of erroring the login route.
 */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  try {
    const salt = Buffer.from(parts[1], "hex");
    const expected = Buffer.from(parts[2], "hex");
    if (expected.length !== SCRYPT_KEYLEN) return false;

    const actual = await scrypt(password, salt, SCRYPT_KEYLEN);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/* --------------------------------------------------------------------------
 * Session token
 * ----------------------------------------------------------------------- */

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set to at least 32 characters. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }
  return secret;
}

const b64url = (input: Buffer | string) =>
  Buffer.from(input).toString("base64url");

/**
 * A signed, stateless token: `<payload>.<hmac>`.
 *
 * The payload is readable by anyone holding the cookie — it carries a user id
 * and an expiry, nothing secret. The HMAC is what makes it unforgeable.
 */
function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: number): string {
  const payload = b64url(
    JSON.stringify({
      uid: userId,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    }),
  );
  return `${payload}.${sign(payload)}`;
}

/** Returns the user id in a valid, unexpired token, or `null`. */
export function readSessionToken(token: string | undefined): number | null {
  if (!token) return null;

  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;

  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  // Length check first: `timingSafeEqual` throws on a length mismatch, and a
  // forged token is exactly where a differing length shows up.
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length) return null;
  if (!timingSafeEqual(expected, actual)) return null;

  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof claims.uid !== "number" || typeof claims.exp !== "number") return null;
    if (claims.exp * 1000 < Date.now()) return null;
    return claims.uid;
  } catch {
    return null;
  }
}

/* --------------------------------------------------------------------------
 * Session
 * ----------------------------------------------------------------------- */

/**
 * The signed-in editor, or `null`.
 *
 * The token proves the cookie was issued by this server. It does **not** prove
 * the account still exists, so this re-reads the row every time. That is one
 * indexed lookup, and it is what makes deleting a user take effect immediately
 * rather than whenever their eight hours happen to run out.
 */
export async function getCurrentUser(): Promise<AdminUser | null> {
  let userId: number | null;
  try {
    const store = await cookies();
    userId = readSessionToken(store.get(SESSION_COOKIE)?.value);
  } catch {
    // Missing or malformed SESSION_SECRET. Treated as signed out rather than a
    // crash, so a misconfigured deploy shows a login page instead of a 500.
    return null;
  }
  if (userId === null) return null;

  try {
    return await queryOne<AdminUser>(
      "SELECT id, email, name FROM admin_users WHERE id = $1",
      [userId],
    );
  } catch (error) {
    console.error("[adflex] session lookup failed:", error);
    return null;
  }
}

/**
 * The guard for every admin page.
 *
 * `src/proxy.ts` also redirects signed-out visitors away from `/admin`, but
 * that is an optimistic check and **is not the security boundary**. It only
 * looks for the presence of a cookie; this verifies the signature and that the
 * account still exists.
 *
 * It **redirects rather than throwing**. Throwing produced a 500 error page
 * whenever a session expired, a cookie was cleared, or the database blinked —
 * all of which are ordinary, and all of which should land an editor on the
 * login form, not on a stack trace.
 */
export async function requireUser(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/* --------------------------------------------------------------------------
 * Login throttling
 * ----------------------------------------------------------------------- */

const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

/**
 * Slows down password guessing.
 *
 * **In-memory, therefore per-instance.** It stops someone hammering a single
 * server; it does not stop a distributed attempt, and it resets on redeploy. It
 * is a speed bump, not a lockout. If this admin ever faces the open internet
 * rather than a handful of editors, move it to the database or put the route
 * behind the host's rate limiting.
 */
export function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const record = attempts.get(key);
  if (!record || now - record.first > WINDOW_MS) return false;
  return record.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const record = attempts.get(key);
  if (!record || now - record.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
    return;
  }
  record.count += 1;
}

export function clearAttempts(key: string): void {
  attempts.delete(key);
}
