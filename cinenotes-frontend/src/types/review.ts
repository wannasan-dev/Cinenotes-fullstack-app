import type { UserSummaryResponse } from "./user";

export type ReviewCreateRequest = {
  titleId: number;
  rating: number;
  reviewText: string | null;
  reviewLanguage: string | null;
  containsSpoiler: boolean | null;
};

export type ReviewUpdateRequest = {
  rating: number | null;
  reviewText: string | null;
  reviewLanguage: string | null;
  containsSpoiler: boolean | null;
};

export type ReviewResponse = {
  id: number;
  user: UserSummaryResponse;
  titleId: number;
  titleName: string;
  rating: number;
  reviewText: string | null;
  reviewLanguage: string | null;
  containsSpoiler: boolean | null;
  visible: boolean | null;
  createdAt: string;
  updatedAt: string;
};
