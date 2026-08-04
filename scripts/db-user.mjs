/**
 * Creates or updates an editor account.
 *
 *   npm run db:user -- ann@mu.ie "Ann McKeon"
 *
 * The password is asked for interactively and never appears in an argument, so
 * it does not land in shell history or a process list. Re-running for an email
 * that already exists resets that person's password, which is also how you
 * recover from a forgotten one — there is deliberately no reset flow on the web
 * surface.
 */
import { createInterface } from "node:readline";
import { scrypt as scryptCallback, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import pg from "pg";
import { loadEnv } from "./load-env.mjs";

loadEnv();

const scrypt = promisify(scryptCallback);

const [email, name] = process.argv.slice(2);

if (!email || !name) {
  console.error('Usage: npm run db:user -- <email> "<full name>"');
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error(`"${email}" does not look like an email address.`);
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. See docs/ADMIN.md.");
  process.exit(1);
}

/*
 * Piped-input line reader.
 *
 * One readline interface for the whole run, not one per prompt. readline reads
 * ahead and buffers, so a second interface created after the first is closed
 * finds stdin already drained and waits forever — which is exactly how the
 * "Confirm:" prompt hung the first time.
 */
let sharedInput = null;
const bufferedLines = [];
const waitingReaders = [];

function nonTtyLine() {
  if (!sharedInput) {
    sharedInput = createInterface({ input: process.stdin });
    sharedInput.on("line", (line) => {
      const reader = waitingReaders.shift();
      if (reader) reader(line);
      else bufferedLines.push(line);
    });
  }
  if (bufferedLines.length) return Promise.resolve(bufferedLines.shift());
  return new Promise((resolve) => waitingReaders.push(resolve));
}

/** Releases stdin so the process can exit once the prompts are answered. */
function closeInput() {
  sharedInput?.close();
  sharedInput = null;
}

/**
 * Reads a line without showing it.
 *
 * Raw mode, reading a character at a time and echoing an asterisk, rather than
 * readline with its output muted. The muted-readline trick relies on the
 * private `_writeToOutput` hook and on the terminal not echoing for itself,
 * which is not true on a Windows console — the password appeared in clear.
 *
 * When stdin is not a terminal (piped input, CI) there is nothing to echo and
 * nothing to mask, so it falls back to reading the line plainly. That is what
 * makes the script testable without a human at the keyboard.
 */
function askHidden(prompt) {
  process.stdout.write(prompt);

  if (!process.stdin.isTTY) {
    return nonTtyLine().then((line) => {
      process.stdout.write("\n");
      return line;
    });
  }

  return new Promise((resolve, reject) => {
    let value = "";
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    const finish = (result, error) => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener("data", onData);
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(result);
    };

    const onData = (chunk) => {
      for (const char of chunk) {
        switch (char) {
          case "\r":
          case "\n":
            return finish(value);
          // Ctrl-C: raw mode swallows the usual interrupt, so it is handled here
          // or the only way out of a password prompt is to kill the terminal.
          case "":
            return finish(null, new Error("Cancelled."));
          case "": // Backspace
          case "\b":
            if (value.length > 0) {
              value = value.slice(0, -1);
              process.stdout.write("\b \b");
            }
            break;
          default:
            // Ignore other control characters rather than storing them.
            if (char >= " ") {
              value += char;
              process.stdout.write("*");
            }
        }
      }
    };

    process.stdin.on("data", onData);
  });
}

const password = await askHidden("Password: ");
const again = await askHidden("Confirm:  ");
closeInput();

if (password !== again) {
  console.error("Those did not match.");
  process.exit(1);
}
if (password.length < 12) {
  // Length beats complexity rules. This is the only gate, and it is a real one:
  // this account can publish to a public, publicly funded website.
  console.error("Please use at least 12 characters.");
  process.exit(1);
}

const salt = randomBytes(16);
const derived = await scrypt(password, salt, 64);
const hash = `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)
    ? undefined
    : { rejectUnauthorized: false },
});

try {
  await client.connect();
  const { rows } = await client.query(
    `INSERT INTO admin_users (email, name, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash
     RETURNING id, (xmax = 0) AS created`,
    [email.toLowerCase(), name, hash],
  );
  const { id, created } = rows[0];
  console.log(created ? `Created account #${id} for ${email}.` : `Updated the password for ${email}.`);
  console.log("Sign in at /admin/login");
} catch (error) {
  if (error.code === "42P01") {
    console.error("The admin_users table does not exist. Run  npm run db:setup  first.");
  } else {
    console.error("Could not save that account:\n", error.message);
  }
  process.exit(1);
} finally {
  await client.end();
}
