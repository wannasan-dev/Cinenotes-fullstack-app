import { useState, type FormEvent } from "react";
import { login, register } from "../api/authApi";
import { ApiError } from "../api/apiClient";
import type { AuthResponse } from "../types/auth";

export type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onAuthSuccess: (response: AuthResponse) => void;
};

export function AuthForm({
  mode,
  onModeChange,
  onAuthSuccess,
}: AuthFormProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === "login";
  const canSubmit = isLogin
    ? usernameOrEmail.trim() !== "" && password.trim() !== "" && !submitting
    : username.trim() !== "" &&
      email.trim() !== "" &&
      password.trim() !== "" &&
      !submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const response = isLogin
        ? await login({ usernameOrEmail, password })
        : await register({ username, email, password, displayName });

      onAuthSuccess(response);
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError));
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(nextMode: AuthMode) {
    setError("");
    setPassword("");
    onModeChange(nextMode);
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {isLogin ? (
        <label>
          Username or email
          <input
            autoFocus
            value={usernameOrEmail}
            onChange={(event) => setUsernameOrEmail(event.target.value)}
            autoComplete="username"
          />
        </label>
      ) : (
        <>
          <label>
            Username
            <input
              autoFocus
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>

          <label>
            Display name <span className="optional-label">Optional</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="name"
            />
          </label>
        </>
      )}

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
      </label>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button className="primary-button auth-submit" type="submit" disabled={!canSubmit}>
        {submitting
          ? isLogin
            ? "Signing in..."
            : "Creating account..."
          : isLogin
            ? "Sign in"
            : "Create account"}
      </button>

      <button
        className="text-button auth-mode-switch"
        type="button"
        onClick={() => switchMode(isLogin ? "register" : "login")}
        disabled={submitting}
      >
        {isLogin
          ? "New to CineNotes? Create your journal"
          : "Already have an account? Sign in"}
      </button>
    </form>
  );
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Authentication failed. Please try again.";
}
