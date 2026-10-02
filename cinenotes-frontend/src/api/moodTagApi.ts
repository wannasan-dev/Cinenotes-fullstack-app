import type { MoodTagResponse } from "../types/title";
import { apiRequest } from "./apiClient";

export function fetchMoodTags(
  token?: string | null
): Promise<MoodTagResponse[]> {
  return apiRequest<MoodTagResponse[]>("/mood-tags", { token });
}
