export type TitleType = "MOVIE" | "SERIES";

export type GenreResponse = {
  id: number;
  tmdbGenreId: number | null;
  name: string;
};

export type MoodTagResponse = {
  id: number;
  name: string;
  description: string | null;
};

export type Title = {
  id: number;
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
  genres: GenreResponse[];
  moodTags: MoodTagResponse[];
  createdAt: string;
  updatedAt: string;
};

export type TitleSummary = Pick<
  Title,
  "id" | "tmdbId" | "type" | "name" | "posterPath" | "releaseDate"
>;
