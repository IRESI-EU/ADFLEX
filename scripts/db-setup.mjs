/**
 * Creates the admin tables. Safe to re-run — every statement in schema.sql is
 * `IF NOT EXISTS`, so this never drops or overwrites anything.
 *
 *   npm run db:setup
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";
import { loadEnv } from "./load-env.mjs";

loadEnv();

const here = dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set.\n\n" +
      "Copy .env.example to .env.local and put your Postgres connection string in it.\n" +
      "See docs/ADMIN.md.",
  );
  process.exit(1);
}

const sql = await readFile(join(here, "..", "src", "lib", "schema.sql"), "utf8");

/**
 * Splits the schema into individual statements.
 *
 * Two reasons not to send the whole file as one string. It reports which
 * statement failed rather than just "syntax error somewhere in 100 lines", and
 * not every Postgres endpoint accepts a multi-statement simple query — a
 * connection pooler or a wire-protocol shim can reset the connection on one.
 *
 * The parser tracks single-quoted literals and `--` comments, which is enough
 * for this file. It does **not** understand dollar-quoted bodies (`$$ … $$`),
 * so if a trigger or function is ever added to schema.sql, this has to grow
 * with it or the body will be split at its internal semicolons.
 */
function splitStatements(text) {
  const statements = [];
  let current = "";
  let inString = false;
  let inComment = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inComment) {
      if (char === "\n") inComment = false;
      current += char;
      continue;
    }
    if (!inString && char === "-" && text[i + 1] === "-") {
      inComment = true;
      current += char;
      continue;
    }
    if (char === "'") {
      // '' inside a literal is an escaped quote, not the end of one.
      if (inString && text[i + 1] === "'") {
        current += "''";
        i++;
        continue;
      }
      inString = !inString;
      current += char;
      continue;
    }
    if (char === ";" && !inString) {
      if (current.trim()) statements.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  if (current.trim()) statements.push(current.trim());
  return statements;
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)
    ? undefined
    : { rejectUnauthorized: false },
});

try {
  await client.connect();

  const statements = splitStatements(sql);
  for (const [index, statement] of statements.entries()) {
    try {
      await client.query(statement);
    } catch (error) {
      const firstLine = statement.split("\n")[0];
      throw new Error(
        `statement ${index + 1} of ${statements.length} failed (${firstLine}…)\n  ${error.message}`,
      );
    }
  }

  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = current_schema()
     ORDER BY table_name`,
  );

  console.log("Schema applied. Tables now present:");
  for (const row of rows) console.log("  -", row.table_name);
  console.log("\nNext: create an editor account with  npm run db:user");
} catch (error) {
  console.error("Could not apply the schema:\n", error.message);
  process.exit(1);
} finally {
  await client.end();
}
