import type { AuthResponse, AuthState } from "../types/auth";

const AUTH_STORAGE_KEY = "cinenotes.auth";

export function getStoredAuth(): AuthState | null {
  const rawAuth = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawAuth) {
    return null;
  }

  try {
    const parsedAuth = JSON.parse(rawAuth) as AuthState;

    if (!parsedAuth.token || !parsedAuth.user) {
      clearStoredAuth();
      return null;
    }

    return parsedAuth;
  } catch {
    clearStoredAuth();
    return null;
  }
}

export function storeAuth(response: AuthResponse): AuthState {
  const authState: AuthState = {
    token: response.token,
    user: response.user,
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  return authState;
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredToken(): string | null {
  return getStoredAuth()?.token ?? null;
}
