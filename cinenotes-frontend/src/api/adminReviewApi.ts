import { apiRequest } from "./apiClient";
import type { ReviewResponse } from "../types/review";

export function fetchAdminReviews(
  visible?: boolean,
  token?: string | null
): Promise<ReviewResponse[]> {
  const query = visible === undefined ? "" : `?visible=${visible}`;
  return apiRequest<ReviewResponse[]>(`/admin/reviews${query}`, { token });
}

export function hideAdminReview(
  id: number,
  token?: string | null
): Promise<ReviewResponse> {
  return apiRequest<ReviewResponse>(`/admin/reviews/${id}/hide`, {
    method: "PATCH",
    token,
  });
}

export function restoreAdminReview(
  id: number,
  token?: string | null
): Promise<ReviewResponse> {
  return apiRequest<ReviewResponse>(`/admin/reviews/${id}/restore`, {
    method: "PATCH",
    token,
  });
}
