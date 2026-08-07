import { apiRequest } from "./apiClient";
import type { MoodTagRequest } from "../types/admin";
import type { MoodTagResponse } from "../types/title";

export function fetchAdminMoodTags(
  token?: string | null
): Promise<MoodTagResponse[]> {
  return apiRequest<MoodTagResponse[]>("/admin/mood-tags", { token });
}

export function fetchAdminMoodTagById(
  id: number,
  token?: string | null
): Promise<MoodTagResponse> {
  return apiRequest<MoodTagResponse>(`/admin/mood-tags/${id}`, { token });
}

export function createAdminMoodTag(
  request: MoodTagRequest,
  token?: string | null
): Promise<MoodTagResponse> {
  return apiRequest<MoodTagResponse>("/admin/mood-tags", {
    method: "POST",
    body: request,
    token,
  });
}

export function updateAdminMoodTag(
  id: number,
  request: MoodTagRequest,
  token?: string | null
): Promise<MoodTagResponse> {
  return apiRequest<MoodTagResponse>(`/admin/mood-tags/${id}`, {
    method: "PUT",
    body: request,
    token,
  });
}

export function deleteAdminMoodTag(
  id: number,
  token?: string | null
): Promise<void> {
  return apiRequest<void>(`/admin/mood-tags/${id}`, {
    method: "DELETE",
    token,
  });
}
