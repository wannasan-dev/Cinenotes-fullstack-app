import { apiRequest } from "./apiClient";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth";

export function login(request: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: request,
  });
}

export function register(request: RegisterRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: request,
  });
}
