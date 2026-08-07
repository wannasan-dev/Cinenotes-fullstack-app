import { apiRequest } from "./apiClient";
import type {
  WatchLogCreateRequest,
  WatchLogResponse,
  WatchLogUpdateRequest,
} from "../types/watchLog";

export function createWatchLog(
  request: WatchLogCreateRequest,
  token?: string | null
): Promise<WatchLogResponse> {
  return apiRequest<WatchLogResponse>("/watch-logs", {
    method: "POST",
    body: request,
    token,
  });
}

export function updateWatchLog(
  id: number,
  request: WatchLogUpdateRequest,
  token?: string | null
): Promise<WatchLogResponse> {
  return apiRequest<WatchLogResponse>(`/watch-logs/${id}`, {
    method: "PATCH",
    body: request,
    token,
  });
}

export function deleteWatchLog(
  id: number,
  token?: string | null
): Promise<void> {
  return apiRequest<void>(`/watch-logs/${id}`, {
    method: "DELETE",
    token,
  });
}

export function fetchWatchLogById(
  id: number,
  token?: string | null
): Promise<WatchLogResponse> {
  return apiRequest<WatchLogResponse>(`/watch-logs/${id}`, { token });
}

export function fetchCurrentUserWatchLogs(
  token?: string | null
): Promise<WatchLogResponse[]> {
  return apiRequest<WatchLogResponse[]>("/watch-logs", { token });
}

export function fetchCurrentUserWatchLogsByTitle(
  titleId: number,
  token?: string | null
): Promise<WatchLogResponse[]> {
  return apiRequest<WatchLogResponse[]>(`/watch-logs/title/${titleId}`, {
    token,
  });
}
