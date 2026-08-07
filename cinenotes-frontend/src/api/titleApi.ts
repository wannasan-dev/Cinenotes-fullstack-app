import { apiRequest } from "./apiClient";
import type { GenreResponse, MoodTagResponse, Title, TitleType } from "../types/title";

export type TitleRequest = {
  tmdbId: number | null;
  type: TitleType;
  name: string;
  originalName: string | null;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  runtimeMinutes: number | null;
  originalLanguage: string | null;
  country: string | null;
  tmdbVoteAverage: number | null;
  tmdbVoteCount: number | null;
  genreIds: number[];
  moodTagIds: number[];
};

export type TitleQuery = {
  type?: TitleType;
  genre?: string;
  keyword?: string;
};

export function fetchTitles(query: TitleQuery = {}): Promise<Title[]> {
  const searchParams = new URLSearchParams();

  if (query.type) {
    searchParams.set("type", query.type);
  }

  if (query.genre) {
    searchParams.set("genre", query.genre);
  }

  if (query.keyword) {
    searchParams.set("keyword", query.keyword);
  }

  const queryString = searchParams.toString();
  return apiRequest<Title[]>(`/titles${queryString ? `?${queryString}` : ""}`);
}

export function fetchTitleById(id: number): Promise<Title> {
  return apiRequest<Title>(`/titles/${id}`);
}

export function fetchAdminGenres(token?: string | null): Promise<GenreResponse[]> {
  return apiRequest<GenreResponse[]>("/admin/genres", { token });
}

export function fetchAdminMoodTags(token?: string | null): Promise<MoodTagResponse[]> {
  return apiRequest<MoodTagResponse[]>("/admin/mood-tags", { token });
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
