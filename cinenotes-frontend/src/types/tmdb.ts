import type { Title, TitleType } from "./title";

export type TmdbTitleSearchResult = {
  tmdbId: number;
  type: TitleType;
  name: string;
  originalName: string | null;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  originalLanguage: string | null;
  tmdbVoteAverage: number | null;
  tmdbVoteCount: number | null;
  alreadyImported: boolean;
};

export type TmdbSearchResponse = {
  page: number;
  totalPages: number;
  totalResults: number;
  results: TmdbTitleSearchResult[];
};

export type TmdbImportSummaryResponse = {
  imported: number;
  skipped: number;
  failed: number;
  failureMessages: string[];
};

export type TmdbImportedTitle = Title;
