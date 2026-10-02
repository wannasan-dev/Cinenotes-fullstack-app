import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ApiError } from "../api/apiClient";
import { fetchCurrentUserReviews } from "../api/reviewApi";
import {
  fetchCurrentUserProfile,
  updateCurrentUserProfile,
} from "../api/userApi";
import { fetchCurrentUserWatchLogs } from "../api/watchLogApi";
import { fetchCurrentUserWatchlist } from "../api/watchlistApi";
import type { ReviewResponse } from "../types/review";
import type { TitleOpenOptions } from "../types/titleNavigation";
import type { UserProfileResponse } from "../types/user";
import type { WatchLogResponse } from "../types/watchLog";

type ProfilePanelProps = {
  authToken: string;
  initialProfile: UserProfileResponse;
  onProfileUpdated: (profile: UserProfileResponse) => void;
  onOpenTitle: (titleId: number, options?: TitleOpenOptions) => Promise<void>;
};

type ProfileFormData = {
  displayName: string;
  bio: string;
  profileImage: string;
  preferredLanguage: string;
};

type ProfileOverview = {
  watchMemories: number;
  reviews: number;
  watchlist: number;
  favorites: number;
};

type RecentActivity = {
  id: string;
  titleId: number;
  watchLogId?: number;
  kind: "Watch memory" | "Review";
  title: string;
  detail: string | null;
  timestamp: string;
};

export function ProfilePanel({
  authToken,
  initialProfile,
  onProfileUpdated,
  onOpenTitle,
}: ProfilePanelProps) {
  const [profile, setProfile] = useState<UserProfileResponse>(initialProfile);
  const [formData, setFormData] = useState<ProfileFormData>(() => toProfileFormData(initialProfile));
  const [overview, setOverview] = useState<ProfileOverview | null>(null);
  const [watchLogs, setWatchLogs] = useState<WatchLogResponse[]>([]);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [editing, setEditing] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [overviewError, setOverviewError] = useState("");
  const [activityError, setActivityError] = useState("");
  const [openingActivityId, setOpeningActivityId] = useState<string | null>(null);

  const recentActivity = useMemo(
    () => buildRecentActivity(watchLogs, reviews),
    [reviews, watchLogs]
  );

  useEffect(() => {
    async function loadProfilePage() {
      setLoading(true);
      setError("");
      setOverviewError("");

      await Promise.all([
        fetchCurrentUserProfile(authToken)
          .then((currentProfile) => {
            setProfile(currentProfile);
            setFormData(toProfileFormData(currentProfile));
            setImageFailed(false);
            onProfileUpdated(currentProfile);
          })
          .catch((profileError) => setError(getProfileErrorMessage(profileError))),
        Promise.all([
          fetchCurrentUserWatchLogs(authToken),
          fetchCurrentUserReviews(authToken),
          fetchCurrentUserWatchlist(authToken),
        ])
          .then(([currentWatchLogs, currentReviews, watchlistItems]) => {
            setWatchLogs(currentWatchLogs);
            setReviews(currentReviews);
            setOverview({
              watchMemories: currentWatchLogs.length,
              reviews: currentReviews.length,
              watchlist: watchlistItems.length,
              favorites: watchlistItems.filter((item) => Boolean(item.favorite)).length,
            });
          })
          .catch(() => setOverviewError("Some viewing details could not be refreshed right now.")),
      ]);

      setLoading(false);
    }

    loadProfilePage();
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
      setImageFailed(false);
      setEditing(false);
      onProfileUpdated(updatedProfile);
      setMessage("Profile updated.");
    } catch (saveError) {
      setError(getProfileErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  function startEditing() {
    setFormData(toProfileFormData(profile));
    setImageFailed(false);
    setMessage("");
    setError("");
    setEditing(true);
  }

  function cancelEditing() {
    setFormData(toProfileFormData(profile));
    setImageFailed(false);
    setError("");
    setEditing(false);
  }

  function updateField<Key extends keyof ProfileFormData>(
    key: Key,
    value: ProfileFormData[Key]
  ) {
    setFormData((currentData) => ({ ...currentData, [key]: value }));
    if (key === "profileImage") setImageFailed(false);
  }

  async function openActivity(activity: RecentActivity) {
    if (openingActivityId) return;

    try {
      setOpeningActivityId(activity.id);
      setActivityError("");
      await onOpenTitle(activity.titleId, {
        focusTarget: activity.kind === "Review" ? "review" : "watch-memory",
        watchLogId: activity.watchLogId,
      });
    } catch (openError) {
      setActivityError(
        openError instanceof ApiError
          ? openError.message
          : "Could not open this title right now."
      );
    } finally {
      setOpeningActivityId(null);
    }
  }

  const visibleProfile = editing
    ? { ...profile, displayName: formData.displayName || null, profileImage: formData.profileImage || null }
    : profile;

  return (
    <section className="profile-page" aria-labelledby="profile-heading">
      <header className="profile-page-heading">
        <div>
          <h1 id="profile-heading">Profile</h1>
          <p>Your CineNotes identity and viewing life.</p>
        </div>
        {!editing && (
          <button className="profile-edit-action" type="button" onClick={startEditing}>Edit Profile</button>
        )}
      </header>

      <div className={editing ? "profile-identity editing" : "profile-identity"}>
        <ProfileAvatar profile={visibleProfile} imageFailed={imageFailed} onImageError={() => setImageFailed(true)} />

        {!editing ? (
          <div className="profile-identity-copy">
            <h2>{profile.displayName || profile.username}</h2>
            <p className="profile-username">@{profile.username}</p>
            <p className={profile.bio ? "profile-bio" : "profile-bio missing"}>
              {profile.bio || "No bio yet."}
            </p>
            <dl className="profile-account-details">
              <div><dt>Preferred language</dt><dd>{profile.preferredLanguage || "Not set"}</dd></div>
              <div><dt>Member since</dt><dd>{formatDate(profile.createdAt)}</dd></div>
              <div><dt>Email</dt><dd>{profile.email}</dd></div>
            </dl>
          </div>
        ) : (
          <form className="profile-edit-form" onSubmit={handleSubmit}>
            <div className="profile-edit-form-heading">
              <h2>Edit Profile</h2>
              <p>@{profile.username}</p>
            </div>

            <label>
              Display name
              <input
                value={formData.displayName}
                disabled={saving}
                onChange={(event) => updateField("displayName", event.target.value)}
                maxLength={100}
              />
            </label>

            <label>
              Preferred language
              <input
                value={formData.preferredLanguage}
                disabled={saving}
                onChange={(event) => updateField("preferredLanguage", event.target.value)}
                maxLength={20}
              />
            </label>

            <label className="profile-edit-form-full">
              Profile image URL
              <input
                value={formData.profileImage}
                disabled={saving}
                onChange={(event) => updateField("profileImage", event.target.value)}
                maxLength={1000}
              />
            </label>

            <label className="profile-edit-form-full">
              Bio
              <textarea
                value={formData.bio}
                disabled={saving}
                onChange={(event) => updateField("bio", event.target.value)}
                maxLength={2000}
              />
            </label>

            {error && <p className="form-error" role="alert">{error}</p>}

            <div className="profile-edit-form-actions">
              <button type="button" disabled={saving} onClick={cancelEditing}>Cancel</button>
              <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
            </div>
          </form>
        )}
      </div>

      {!editing && (
        <>
          {message && <p className="form-success profile-message" role="status">{message}</p>}
          {error && <p className="form-error profile-message" role="alert">{error}</p>}
          {loading && <p className="profile-refresh-note" role="status">Refreshing your profile…</p>}
          {overviewError && <p className="profile-overview-error" role="status">{overviewError}</p>}

          <section className="profile-section profile-overview" aria-labelledby="profile-overview-heading">
            <h2 id="profile-overview-heading">Your viewing overview</h2>
            {overview ? (
              <dl className="profile-stats">
                <div><dd>{overview.watchMemories}</dd><dt>Watch memories</dt></div>
                <div><dd>{overview.reviews}</dd><dt>Reviews</dt></div>
                <div><dd>{overview.watchlist}</dd><dt>Watchlist titles</dt></div>
                <div><dd>{overview.favorites}</dd><dt>Favorites</dt></div>
              </dl>
            ) : !loading ? (
              <p className="profile-section-empty">Viewing totals are unavailable right now.</p>
            ) : null}
          </section>

          <section className="profile-section profile-recent-activity" aria-labelledby="recent-activity-heading">
            <h2 id="recent-activity-heading">Recent Activity</h2>
            {recentActivity.length > 0 ? (
              <ol>
                {recentActivity.map((activity) => (
                  <li key={activity.id}>
                    <button
                      className="profile-activity-link"
                      type="button"
                      aria-label={`Open ${activity.kind.toLowerCase()} for ${activity.title}`}
                      disabled={openingActivityId !== null}
                      onClick={() => openActivity(activity)}
                    >
                      <div>
                        <span>{activity.kind}</span>
                        <strong>{activity.title}</strong>
                        {activity.detail && <p>{activity.detail}</p>}
                      </div>
                      <time dateTime={activity.timestamp}>{formatDate(activity.timestamp)}</time>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="profile-section-empty">No recent activity yet.</p>
            )}
            {activityError && <p className="form-error profile-activity-error" role="alert">{activityError}</p>}
          </section>
        </>
      )}
    </section>
  );
}

function ProfileAvatar({
  profile,
  imageFailed,
  onImageError,
}: {
  profile: UserProfileResponse;
  imageFailed: boolean;
  onImageError: () => void;
}) {
  return (
    <div className="profile-page-avatar" aria-label={`${profile.displayName || profile.username} avatar`}>
      {profile.profileImage && !imageFailed ? (
        <img src={profile.profileImage} alt="" onError={onImageError} />
      ) : (
        <span>{getInitial(profile)}</span>
      )}
    </div>
  );
}

function buildRecentActivity(
  watchLogs: WatchLogResponse[],
  reviews: ReviewResponse[]
): RecentActivity[] {
  const watchActivity: RecentActivity[] = watchLogs.map((log) => ({
    id: `watch-${log.id}`,
    titleId: log.title.id,
    watchLogId: log.id,
    kind: "Watch memory",
    title: log.title.name,
    detail: log.memoryNote,
    timestamp: log.watchedDate ? `${log.watchedDate}T00:00:00` : log.createdAt,
  }));
  const reviewActivity: RecentActivity[] = reviews.map((review) => ({
    id: `review-${review.id}`,
    titleId: review.titleId,
    kind: "Review",
    title: review.titleName,
    detail: review.reviewText || `${review.rating.toFixed(1)} / 10`,
    timestamp: review.updatedAt,
  }));

  return [...watchActivity, ...reviewActivity]
    .sort((first, second) => second.timestamp.localeCompare(first.timestamp))
    .slice(0, 3);
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
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

function getProfileErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return "Could not update profile right now.";
}
