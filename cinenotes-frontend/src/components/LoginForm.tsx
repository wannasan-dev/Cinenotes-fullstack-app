import { useState,type FormEvent } from "react";
import { login } from "../api/authApi";

type LoginFormProps = { 
  onLoginSuccess: (token: string, username: string, role: "ADMIN") => void;
};

function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = username.trim() !== "" && password.trim() !== "" && !submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const response = await login({
        username,
        password,
      });

      onLoginSuccess(response.token, response.username, response.role);
    } catch (error) {
      setError("Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Admin Login</h2>

      <label>
        Username
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {error && <p className="error-message">{error}</p>}

      <button type="submit" className="login-submit-button" disabled={!canSubmit}>
        {submitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

export default LoginForm;
