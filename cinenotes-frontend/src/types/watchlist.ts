import type { TitleSummary } from "./title";

export type WatchStatus = "WANT_TO_WATCH" | "WATCHING" | "WATCHED" | "DROPPED";

export type WatchlistUpsertRequest = {
  titleId: number;
  status: WatchStatus;
  favorite: boolean | null;
};

export type WatchlistItemResponse = {
  id: number;
  title: TitleSummary;
  status: WatchStatus;
  favorite: boolean | null;
  createdAt: string;
  updatedAt: string;
};
