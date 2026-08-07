import type { MoodTagResponse, TitleSummary } from "./title";

export type WatchPlace = "HOME" | "CINEMA" | "STREAMING" | "SCHOOL" | "OTHER";

export type WatchCompany = "ALONE" | "FRIENDS" | "FAMILY" | "PARTNER" | "OTHER";

export type WatchLogCreateRequest = {
  titleId: number;
  watchedDate: string | null;
  watchPlace: WatchPlace | null;
  watchCompany: WatchCompany | null;
  rewatch: boolean | null;
  memoryNote: string | null;
  moodTagIds: number[] | null;
};

export type WatchLogUpdateRequest = {
  watchedDate?: string | null;
  watchPlace?: WatchPlace | null;
  watchCompany?: WatchCompany | null;
  rewatch?: boolean | null;
  memoryNote?: string | null;
  moodTagIds?: number[] | null;
};

export type WatchLogResponse = {
  id: number;
  title: TitleSummary;
  watchedDate: string | null;
  watchPlace: WatchPlace | null;
  watchCompany: WatchCompany | null;
  rewatch: boolean | null;
  memoryNote: string | null;
  moods: MoodTagResponse[];
  createdAt: string;
  updatedAt: string;
};
