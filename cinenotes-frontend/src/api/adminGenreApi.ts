import { apiRequest } from "./apiClient";
import type { GenreRequest } from "../types/admin";
import type { GenreResponse } from "../types/title";

export function fetchAdminGenres(
  token?: string | null
): Promise<GenreResponse[]> {
  return apiRequest<GenreResponse[]>("/admin/genres", { token });
}

export function fetchAdminGenreById(
  id: number,
  token?: string | null
): Promise<GenreResponse> {
  return apiRequest<GenreResponse>(`/admin/genres/${id}`, { token });
}

export function createAdminGenre(
  request: GenreRequest,
  token?: string | null
): Promise<GenreResponse> {
  return apiRequest<GenreResponse>("/admin/genres", {
    method: "POST",
    body: request,
    token,
  });
}

export function updateAdminGenre(
  id: number,
  request: GenreRequest,
  token?: string | null
): Promise<GenreResponse> {
  return apiRequest<GenreResponse>(`/admin/genres/${id}`, {
    method: "PUT",
    body: request,
    token,
  });
}

export function deleteAdminGenre(
  id: number,
  token?: string | null
): Promise<void> {
  return apiRequest<void>(`/admin/genres/${id}`, {
    method: "DELETE",
    token,
  });
}
