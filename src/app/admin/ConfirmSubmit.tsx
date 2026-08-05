"use client";

import { useFormStatus } from "react-dom";

type ConfirmSubmitProps = {
  /** Shown in the dialogue. Say what will happen, not "are you sure?". */
  message: string;
  className?: string;
  pendingLabel?: string;
  children: React.ReactNode;
};

/**
 * A submit button that asks first.
 *
 * Used for the two actions in the admin that a mis-click makes expensive:
 * deleting an entry, and putting one on — or taking one off — the public site.
 *
 * `window.confirm` rather than a custom modal. It is one synchronous call that
 * blocks the submit, it is keyboard-accessible and screen-reader-announced
 * without any work from us, and it cannot be dismissed by a stray click on a
 * backdrop. A hand-built dialogue here would be more code and more ways to get
 * focus handling wrong, on a surface used by three editors.
 *
 * **The guard is in the browser only.** With JavaScript off the form still
 * posts and the action still runs — the confirmation is there to prevent an
 * accident, not to authorise anything. Authorisation is `requireEditor()`
 * inside the action itself.
 */
export function ConfirmSubmit({
  message,
  className,
  pendingLabel,
  children,
}: ConfirmSubmitProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
