import { apiRequest } from "./apiClient";
import type { Title } from "../types/title";

export type TitleRequest = {
  type: "MOVIE" | "SERIES";
  name: string;
  genres: string[];
  rating: number;
  description: string;
  releaseYear: number;
  posterUrl: string;
  reviewText: string;
};

export function fetchTitles(): Promise<Title[]> {
  return apiRequest<Title[]>("/titles");
}

export function createTitle(
  request: TitleRequest,
  token?: string | null
): Promise<Title> {
  return apiRequest<Title>("/admin/titles", {
    method: "POST",
    body: request,
    token,
  });
}

export function updateTitle(
  id: number,
  request: TitleRequest,
  token?: string | null
): Promise<Title> {
  return apiRequest<Title>(`/admin/titles/${id}`, {
    method: "PUT",
    body: request,
    token,
  });
}

export function deleteTitle(id: number, token?: string | null): Promise<void> {
  return apiRequest<void>(`/admin/titles/${id}`, {
    method: "DELETE",
    token,
  });
}
