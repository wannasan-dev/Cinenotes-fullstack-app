import { apiRequest } from "./apiClient";
import type {
  WatchlistItemResponse,
  WatchlistUpsertRequest,
} from "../types/watchlist";

export function upsertWatchlistItem(
  request: WatchlistUpsertRequest,
  token?: string | null
): Promise<WatchlistItemResponse> {
  return apiRequest<WatchlistItemResponse>("/watchlist", {
    method: "PUT",
    body: request,
    token,
  });
}

export function removeWatchlistItemByTitle(
  titleId: number,
  token?: string | null
): Promise<void> {
  return apiRequest<void>(`/watchlist/title/${titleId}`, {
    method: "DELETE",
    token,
  });
}

export function fetchCurrentUserWatchlist(
  token?: string | null
): Promise<WatchlistItemResponse[]> {
  return apiRequest<WatchlistItemResponse[]>("/watchlist", { token });
}

export function fetchCurrentUserWatchlistItemByTitle(
  titleId: number,
  token?: string | null
): Promise<WatchlistItemResponse> {
  return apiRequest<WatchlistItemResponse>(`/watchlist/title/${titleId}`, {
    token,
  });
}
