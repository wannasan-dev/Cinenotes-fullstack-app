export type UserRole = "USER" | "ADMIN";

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  profileImage: string | null;
  role: UserRole;
  preferredLanguage: string | null;
  createdAt: string;
};

export type LoginRequest = {
  usernameOrEmail: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  displayName: string;
};

export type AuthResponse = {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: UserProfile;
};

export type AuthState = {
  token: string;
  user: UserProfile;
};
