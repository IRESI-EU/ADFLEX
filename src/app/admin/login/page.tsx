import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import { LoginForm } from "../forms";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

/**
 * Sign in.
 *
 * There is no sign-up, no password reset and no "remember me". Accounts are
 * created from the command line with `npm run db:user` — a self-service account
 * form on an admin surface is a way in, and this has three editors, not three
 * thousand.
 */
export default async function AdminLoginPage() {
  // Already signed in: skip the form rather than offer a second login.
  if (await getCurrentUser()) redirect("/admin");

  const configured = isDatabaseConfigured();

  return (
    <div className={styles.loginShell}>
      <div className={styles.loginCard}>
        <h1 className={styles.pageTitle}>ADFLEX admin</h1>

        {configured ? (
          <>
            <p className={styles.pageLead}>Sign in to edit outputs, news and events.</p>
            <LoginForm />
          </>
        ) : (
          <div className={styles.setup}>
            <p>
              <strong>Not configured yet.</strong> No <code>DATABASE_URL</code> is
              set, so there is nothing to sign in to.
            </p>
            <ol>
              <li>
                Copy <code>.env.example</code> to <code>.env.local</code> and put
                your Postgres connection string in <code>DATABASE_URL</code>.
              </li>
              <li>
                Set <code>SESSION_SECRET</code> to a long random string.
              </li>
              <li>
                Run <code>npm run db:setup</code> to create the tables, then{" "}
                <code>npm run db:user</code> to create your account.
              </li>
            </ol>
            <p className={styles.panelNote}>
              Full instructions are in <code>docs/ADMIN.md</code>. The public site
              works without any of this — only the admin needs it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
