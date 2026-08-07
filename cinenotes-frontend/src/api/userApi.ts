import { apiRequest } from "./apiClient";
import type {
  UpdateProfileRequest,
  UserProfileResponse,
  UserSummaryResponse,
} from "../types/user";

export function fetchCurrentUserProfile(
  token?: string | null
): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>("/users/me", { token });
}

export function updateCurrentUserProfile(
  request: UpdateProfileRequest,
  token?: string | null
): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>("/users/me", {
    method: "PATCH",
    body: request,
    token,
  });
}

export function fetchUserById(id: number): Promise<UserSummaryResponse> {
  return apiRequest<UserSummaryResponse>(`/users/${id}`);
}

export function fetchUserByUsername(
  username: string
): Promise<UserSummaryResponse> {
  return apiRequest<UserSummaryResponse>(
    `/users/by-username/${encodeURIComponent(username)}`
  );
}
