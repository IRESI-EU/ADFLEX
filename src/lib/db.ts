import "server-only";

import { Pool } from "pg";

/**
 * The Postgres connection.
 *
 * ---------------------------------------------------------------------------
 * THE SITE MUST BUILD AND RENDER WITH NO DATABASE
 * ---------------------------------------------------------------------------
 * This is the rule the rest of the data layer is shaped around, and it is not
 * a nicety. `next build` runs in CI and on Netlify without `DATABASE_URL`, a
 * reviewer clones the repo and runs `npm run dev` before any database exists,
 * and a hosted database can be down while the public site is up.
 *
 * So: nothing here connects at import time, `isDatabaseConfigured()` is a plain
 * environment check that never touches the network, and every read in
 * `src/lib/repo/` is wrapped so a failure degrades to the empty state the
 * public pages already have rather than a 500. What must NOT be wrapped is a
 * write — a save that silently does nothing is worse than an error.
 */

/** True when a connection string exists. Does not prove the database is up. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

declare global {
  var __adflexPool: Pool | undefined;
}

/**
 * One pool per process, cached on `globalThis`.
 *
 * Without the global, `next dev`'s hot reload creates a new pool on every edit
 * and leaks connections until the database refuses new ones — which presents as
 * the site mysteriously dying after twenty file saves.
 */
export function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in — see docs/ADMIN.md.",
    );
  }

  if (!globalThis.__adflexPool) {
    globalThis.__adflexPool = new Pool({
      connectionString,
      // Neon and Supabase both terminate unencrypted connections. `rejectUnauthorized`
      // is off because both serve certificates from a chain Node does not carry by
      // default; the connection is still encrypted. A local database gets no TLS at all.
      ssl: /localhost|127\.0\.0\.1/.test(connectionString)
        ? undefined
        : { rejectUnauthorized: false },
      // Serverless hosts open a pool per instance, so a generous max multiplies
      // into the database's connection limit rather than staying local. Five is
      // right for Neon's and Supabase's pooled endpoints; `PGPOOL_MAX` exists
      // so a host with a tighter limit can be tuned without a code change.
      max: Number(process.env.PGPOOL_MAX) || 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  return globalThis.__adflexPool;
}

/** Runs a parameterised query. Never interpolate user input into the text. */
export async function query<T extends Record<string, unknown>>(
  text: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query<T>(text, params as unknown[]);
  return result.rows;
}

/** The first row, or `null`. */
export async function queryOne<T extends Record<string, unknown>>(
  text: string,
  params: readonly unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/**
 * Wraps a **read** so the public site survives a database that is missing or
 * down, returning `fallback` instead of throwing.
 *
 * Only ever use this for reads. A write wrapped in this would report success
 * while losing the editor's work.
 */
export async function safeRead<T>(
  read: () => Promise<T>,
  fallback: T,
  label: string,
): Promise<T> {
  if (!isDatabaseConfigured()) return fallback;
  try {
    return await read();
  } catch (error) {
    // Logged, not swallowed silently: the page degrades but the operator can
    // still see why in the server output.
    console.error(`[adflex] database read failed (${label}):`, error);
    return fallback;
  }
}
