import type { WatchCompany, WatchPlace } from "../types/watchLog";
import type { WatchStatus } from "../types/watchlist";

export const WATCH_STATUSES: WatchStatus[] = [
  "WANT_TO_WATCH",
  "WATCHING",
  "WATCHED",
  "DROPPED",
];

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
