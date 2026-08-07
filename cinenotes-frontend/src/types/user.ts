import type { UserProfile } from "./auth";

export type UserProfileResponse = UserProfile;

export type UpdateProfileRequest = {
  displayName: string | null;
  bio: string | null;
  profileImage: string | null;
  preferredLanguage: string | null;
};

export type UserSummaryResponse = {
  id: number;
  username: string;
  displayName: string | null;
  profileImage: string | null;
};
