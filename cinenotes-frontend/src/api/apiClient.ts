import { clearStoredAuth, getStoredToken } from "../auth/authStorage";

const DEFAULT_API_BASE_URL = "http://localhost:8080/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? DEFAULT_API_BASE_URL;

type ApiRequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

type ApiErrorPayload = {
  message?: string;
  error?: string;
  messages?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  payload: ApiErrorPayload | null;

  constructor(status: number, message: string, payload: ApiErrorPayload | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const token = options.token ?? getStoredToken();
  const headers = new Headers();

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 401) {
    clearStoredAuth();
  }

  if (!response.ok) {
    const payload = await readErrorPayload(response);
    throw new ApiError(response.status, getErrorMessage(payload, response), payload);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function readErrorPayload(response: Response): Promise<ApiErrorPayload | null> {
  try {
    return (await response.json()) as ApiErrorPayload;
  } catch {
    return null;
  }
}

function getErrorMessage(payload: ApiErrorPayload | null, response: Response) {
  if (payload?.message) {
    return payload.message;
  }

  if (payload?.messages) {
    return Object.values(payload.messages).join(" ");
  }

  return payload?.error ?? `Request failed with status ${response.status}`;
}
