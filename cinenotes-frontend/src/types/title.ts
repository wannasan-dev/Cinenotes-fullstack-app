export type TitleType = "MOVIE" | "SERIES";

export type Title = {
  id: number;
  type: TitleType;
  name: string;
  genres: string[];
  rating: number;
  description: string;
  releaseYear: number;
  posterUrl: string;
  reviewText: string;
  createdAt: string;
  updatedAt: string;
};