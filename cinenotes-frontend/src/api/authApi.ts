import type { LoginRequest, LoginResponse } from "../types/title";

const API_BASE_URL = "http://localhost:8080/api";

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}