import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../api/apiClient";
import {
  fetchCurrentUserProfile,
  updateCurrentUserProfile,
} from "../api/userApi";
import type { UserProfileResponse } from "../types/user";

type ProfilePanelProps = {
  authToken: string;
  initialProfile: UserProfileResponse;
  onProfileUpdated: (profile: UserProfileResponse) => void;
};

type ProfileFormData = {
  displayName: string;
  bio: string;
  profileImage: string;
  preferredLanguage: string;
};

export function ProfilePanel({
  authToken,
  initialProfile,
  onProfileUpdated,
}: ProfilePanelProps) {
  const [profile, setProfile] = useState<UserProfileResponse>(initialProfile);
  const [formData, setFormData] = useState<ProfileFormData>(() =>
    toProfileFormData(initialProfile)
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const currentProfile = await fetchCurrentUserProfile(authToken);
        setProfile(currentProfile);
        setFormData(toProfileFormData(currentProfile));
        onProfileUpdated(currentProfile);
      } catch (error) {
        setError(getProfileErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [authToken, onProfileUpdated]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const updatedProfile = await updateCurrentUserProfile(
        {
          displayName: formData.displayName,
          bio: formData.bio,
          profileImage: formData.profileImage,
          preferredLanguage: formData.preferredLanguage,
        },
        authToken
      );

      setProfile(updatedProfile);
      setFormData(toProfileFormData(updatedProfile));
      onProfileUpdated(updatedProfile);
      setMessage("Profile updated.");
    } catch (error) {
      setError(getProfileErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  function updateField<Key extends keyof ProfileFormData>(
    key: Key,
    value: ProfileFormData[Key]
  ) {
    setFormData((currentData) => ({
      ...currentData,
      [key]: value,
    }));
  }

  return (
    <section className="profile-panel">
      <div className="profile-summary">
        <div className="profile-avatar">
          {profile.profileImage ? (
            <img src={profile.profileImage} alt={profile.displayName ?? profile.username} />
          ) : (
            <span>{getInitial(profile)}</span>
          )}
        </div>

        <div>
          <p className="eyebrow">Current profile</p>
          <h2>{profile.displayName || profile.username}</h2>
          <p className="profile-meta">@{profile.username} • {profile.role}</p>
          <p className="profile-meta">{profile.email}</p>
          <p className="profile-meta">
            Joined {formatDate(profile.createdAt)}
          </p>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <label>
          Display name
          <input
            value={formData.displayName}
            onChange={(event) => updateField("displayName", event.target.value)}
            maxLength={100}
          />
        </label>

        <label>
          Preferred language
          <input
            value={formData.preferredLanguage}
            onChange={(event) =>
              updateField("preferredLanguage", event.target.value)
            }
            maxLength={20}
          />
        </label>

        <label className="profile-form-full">
          Profile image URL
          <input
            value={formData.profileImage}
            onChange={(event) => updateField("profileImage", event.target.value)}
            maxLength={1000}
          />
        </label>

        <label className="profile-form-full">
          Bio
          <textarea
            value={formData.bio}
            onChange={(event) => updateField("bio", event.target.value)}
            maxLength={2000}
          />
        </label>

        {loading && <p className="form-note">Refreshing profile...</p>}
        {message && <p className="form-success">{message}</p>}
        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" disabled={saving || loading}>
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
    </section>
  );
}

function toProfileFormData(profile: UserProfileResponse): ProfileFormData {
  return {
    displayName: profile.displayName ?? "",
    bio: profile.bio ?? "",
    profileImage: profile.profileImage ?? "",
    preferredLanguage: profile.preferredLanguage ?? "",
  };
}

function getInitial(profile: UserProfileResponse) {
  const source = profile.displayName || profile.username;
  return source.charAt(0).toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getProfileErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Could not update profile right now.";
}
