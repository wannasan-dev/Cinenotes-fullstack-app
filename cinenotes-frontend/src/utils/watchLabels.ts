import type { WatchCompany, WatchPlace } from "../types/watchLog";
import type { TitleType } from "../types/title";
import type { WatchStatus } from "../types/watchlist";

export const WATCH_STATUSES: WatchStatus[] = [
  "WANT_TO_WATCH",
  "WATCHING",
  "WATCHED",
  "DROPPED",
];

const MOVIE_WATCH_STATUSES: WatchStatus[] = [
  "WANT_TO_WATCH",
  "WATCHED",
  "DROPPED",
];

export function getWatchStatusesForTitle(
  titleType: TitleType,
  currentStatus?: WatchStatus
): WatchStatus[] {
  if (titleType === "SERIES") return WATCH_STATUSES;
  if (currentStatus === "WATCHING") return ["WATCHING", ...MOVIE_WATCH_STATUSES];
  return MOVIE_WATCH_STATUSES;
}

export const WATCH_PLACES: WatchPlace[] = [
  "HOME",
  "CINEMA",
  "STREAMING",
  "SCHOOL",
  "OTHER",
];

export const WATCH_COMPANIES: WatchCompany[] = [
  "ALONE",
  "FRIENDS",
  "FAMILY",
  "PARTNER",
  "OTHER",
];

export function getWatchStatusLabel(status: WatchStatus) {
  return {
    WANT_TO_WATCH: "Want to watch",
    WATCHING: "Watching",
    WATCHED: "Watched",
    DROPPED: "Dropped",
  }[status];
}

export function getWatchPlaceLabel(place: WatchPlace) {
  return {
    HOME: "Home",
    CINEMA: "Cinema",
    STREAMING: "Streaming",
    SCHOOL: "School",
    OTHER: "Other",
  }[place];
}

export function getWatchCompanyLabel(company: WatchCompany) {
  return {
    ALONE: "Alone",
    FRIENDS: "Friends",
    FAMILY: "Family",
    PARTNER: "Partner",
    OTHER: "Other",
  }[company];
}
