import { apiRequest } from "./apiClient";
import type { TitleType } from "../types/title";
import type {
  TmdbImportedTitle,
  TmdbImportSummaryResponse,
  TmdbSearchResponse,
} from "../types/tmdb";

export function searchTmdbTitles(
  type: TitleType,
  query: string,
  page = 1,
  token?: string | null
): Promise<TmdbSearchResponse> {
  const params = new URLSearchParams({
    query,
    page: String(page),
  });
  const path =
    type === "MOVIE"
      ? `/admin/tmdb/search/movies?${params}`
      : `/admin/tmdb/search/series?${params}`;

  return apiRequest<TmdbSearchResponse>(path, { token });
}

export function importTmdbTitle(
  type: TitleType,
  tmdbId: number,
  token?: string | null
): Promise<TmdbImportedTitle> {
  const mediaPath = type === "MOVIE" ? "movie" : "series";
  return apiRequest<TmdbImportedTitle>(`/admin/tmdb/import/${mediaPath}/${tmdbId}`, {
    method: "POST",
    token,
  });
}

export function importPopularTmdbTitles(
  moviePages: number,
  seriesPages: number,
  token?: string | null
): Promise<TmdbImportSummaryResponse> {
  const params = new URLSearchParams({
    moviePages: String(moviePages),
    seriesPages: String(seriesPages),
  });

  return apiRequest<TmdbImportSummaryResponse>(`/admin/tmdb/import/popular?${params}`, {
    method: "POST",
    token,
  });
}
