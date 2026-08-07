import { useState, type FormEvent } from "react";
import { login, register } from "../api/authApi";
import { ApiError } from "../api/apiClient";
import type { AuthResponse } from "../types/auth";

type LoginFormProps = {
  onAuthSuccess: (response: AuthResponse) => void;
};

type AuthMode = "login" | "register";

function LoginForm({ onAuthSuccess }: LoginFormProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [usernameOrEmail, setUsernameOrEmail] = useState("admin");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("admin123");
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
        ? await login({
            usernameOrEmail,
            password,
          })
        : await register({
            username,
            email,
            password,
            displayName,
          });

      onAuthSuccess(response);
    } catch (error) {
      setError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setPassword(nextMode === "login" ? "admin123" : "");
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>{isLogin ? "Login" : "Create account"}</h2>

      {isLogin ? (
        <label>
          Username or email
          <input
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
            Display name
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

      {error && <p className="error-message">{error}</p>}

      <div className="login-actions">
        <button
          type="button"
          onClick={() => switchMode(isLogin ? "register" : "login")}
          disabled={submitting}
        >
          {isLogin ? "Register" : "Use login"}
        </button>

        <button type="submit" disabled={!canSubmit}>
          {submitting
            ? isLogin
              ? "Logging in..."
              : "Registering..."
            : isLogin
              ? "Login"
              : "Register"}
        </button>
      </div>
    </form>
  );
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Authentication failed. Please try again.";
}

export default LoginForm;
