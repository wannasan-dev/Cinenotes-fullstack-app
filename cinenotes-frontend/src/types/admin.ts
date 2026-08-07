import type { UserRole } from "./auth";
import type { UserSummaryResponse } from "./user";

export type GenreRequest = {
  tmdbGenreId: number | null;
  name: string;
};

export type MoodTagRequest = {
  name: string;
  description: string | null;
};

export type UserAdminResponse = {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  active: boolean | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserRoleRequest = {
  role: UserRole;
};

export type AuditAction =
  | "LOGIN"
  | "REGISTER"
  | "TITLE_IMPORTED"
  | "TITLE_CREATED"
  | "TITLE_UPDATED"
  | "TITLE_DELETED"
  | "REVIEW_CREATED"
  | "REVIEW_UPDATED"
  | "REVIEW_DELETED"
  | "REVIEW_MODERATED"
  | "REVIEW_HIDDEN"
  | "REVIEW_RESTORED"
  | "WATCHLIST_UPDATED"
  | "WATCH_LOG_CREATED"
  | "GENRE_CREATED"
  | "GENRE_UPDATED"
  | "GENRE_DELETED"
  | "MOOD_TAG_CREATED"
  | "MOOD_TAG_UPDATED"
  | "MOOD_TAG_DELETED"
  | "USER_ROLE_UPDATED"
  | "USER_ACTIVATED"
  | "USER_DEACTIVATED";

export type AuditLogResponse = {
  id: number;
  actor: UserSummaryResponse | null;
  action: AuditAction;
  targetType: string;
  targetId: number | null;
  description: string | null;
  createdAt: string;
};
