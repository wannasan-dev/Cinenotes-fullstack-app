import { useEffect, useRef } from "react";
import type { AuthResponse } from "../types/auth";
import { AuthForm, type AuthMode } from "./LoginForm";

type AuthDialogProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onAuthSuccess: (response: AuthResponse) => void;
  onClose: () => void;
};

export function AuthDialog({
  mode,
  onModeChange,
  onAuthSuccess,
  onClose,
}: AuthDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const isLogin = mode === "login";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        )
      );
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="dialog-backdrop" role="presentation">
      <div
        ref={dialogRef}
        className="auth-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
      >
        <button
          className="dialog-close-button"
          type="button"
          onClick={onClose}
          aria-label="Close authentication dialog"
        >
          ×
        </button>

        <p className="eyebrow">CineNotes account</p>
        <h2 id="auth-dialog-title">{isLogin ? "Welcome back" : "Start your journal"}</h2>
        <p className="auth-dialog-copy">
          {isLogin
            ? "Sign in to open your journal."
            : "Create an account to save your watchlist and viewing memories."}
        </p>

        <AuthForm
          key={mode}
          mode={mode}
          onModeChange={onModeChange}
          onAuthSuccess={onAuthSuccess}
        />
      </div>
    </div>
  );
}
