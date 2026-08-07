import { apiRequest } from "./apiClient";
import type {
  ReviewCreateRequest,
  ReviewResponse,
  ReviewUpdateRequest,
} from "../types/review";

export function createReview(
  request: ReviewCreateRequest,
  token?: string | null
): Promise<ReviewResponse> {
  return apiRequest<ReviewResponse>("/reviews", {
    method: "POST",
    body: request,
    token,
  });
}

export function updateReview(
  id: number,
  request: ReviewUpdateRequest,
  token?: string | null
): Promise<ReviewResponse> {
  return apiRequest<ReviewResponse>(`/reviews/${id}`, {
    method: "PATCH",
    body: request,
    token,
  });
}

export function deleteReview(
  id: number,
  token?: string | null
): Promise<void> {
  return apiRequest<void>(`/reviews/${id}`, {
    method: "DELETE",
    token,
  });
}

export function fetchReviewById(id: number): Promise<ReviewResponse> {
  return apiRequest<ReviewResponse>(`/reviews/${id}`);
}

export function fetchVisibleReviewsByTitle(
  titleId: number
): Promise<ReviewResponse[]> {
  return apiRequest<ReviewResponse[]>(`/reviews/title/${titleId}`);
}

export function fetchCurrentUserReviews(
  token?: string | null
): Promise<ReviewResponse[]> {
  return apiRequest<ReviewResponse[]>("/reviews/me", { token });
}
