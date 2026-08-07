import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createReview,
  deleteReview,
  fetchCurrentUserReviews,
  fetchVisibleReviewsByTitle,
  updateReview,
} from "../api/reviewApi";
import { ApiError } from "../api/apiClient";
import type { AuthState } from "../types/auth";
import type {
  ReviewCreateRequest,
  ReviewResponse,
  ReviewUpdateRequest,
} from "../types/review";
import type { Title } from "../types/title";
import { getPosterSrc } from "../utils/poster";

type TitleDetailModalProps = {
  title: Title;
  authState: AuthState | null;
  onClose: () => void;
};

type ReviewFormData = {
  rating: string;
  reviewText: string;
  reviewLanguage: string;
  containsSpoiler: boolean;
};

type ReviewFormProps = {
  mode: "create" | "edit";
  initialReview?: ReviewResponse;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (formData: ReviewFormData) => void;
};

export function TitleDetailModal({
  title,
  authState,
  onClose,
}: TitleDetailModalProps) {
  const [visibleReviews, setVisibleReviews] = useState<ReviewResponse[]>([]);
  const [currentUserReviews, setCurrentUserReviews] = useState<ReviewResponse[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const ownReview = useMemo(
    () => currentUserReviews.find((review) => review.titleId === title.id) ?? null,
    [currentUserReviews, title.id]
  );
  const hiddenOwnReview =
    ownReview &&
    !visibleReviews.some((review) => review.id === ownReview.id)
      ? ownReview
      : null;

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoadingReviews(true);
        setReviewError("");

        const [titleReviews, userReviews] = await Promise.all([
          fetchVisibleReviewsByTitle(title.id),
          authState
            ? fetchCurrentUserReviews(authState.token)
            : Promise.resolve<ReviewResponse[]>([]),
        ]);

        setVisibleReviews(titleReviews);
        setCurrentUserReviews(userReviews);
      } catch (error) {
        setReviewError(getReviewErrorMessage(error));
      } finally {
        setLoadingReviews(false);
      }
    }

    loadReviews();
  }, [authState, title.id]);

  async function refreshReviews() {
    const [titleReviews, userReviews] = await Promise.all([
      fetchVisibleReviewsByTitle(title.id),
      authState
        ? fetchCurrentUserReviews(authState.token)
        : Promise.resolve<ReviewResponse[]>([]),
    ]);

    setVisibleReviews(titleReviews);
    setCurrentUserReviews(userReviews);
  }

  async function handleCreateReview(formData: ReviewFormData) {
    if (!authState) return;

    await submitReview(async () => {
      const request: ReviewCreateRequest = {
        ...toReviewRequest(formData),
        titleId: title.id,
        rating: Number(formData.rating),
      };

      await createReview(request, authState.token);
      setReviewMessage("Review posted.");
    });
  }

  async function handleUpdateReview(formData: ReviewFormData) {
    if (!authState || !editingReview) return;

    await submitReview(async () => {
      const request: ReviewUpdateRequest = {
        ...toReviewRequest(formData),
        rating: Number(formData.rating),
      };

      await updateReview(editingReview.id, request, authState.token);
      setReviewMessage("Review updated.");
    });
  }

  async function handleDeleteReview(review: ReviewResponse) {
    if (!authState) return;

    const shouldDelete = window.confirm("Delete your review for this title?");
    if (!shouldDelete) return;

    try {
      setSubmittingReview(true);
      setReviewError("");
      setReviewMessage("");

      await deleteReview(review.id, authState.token);
      await refreshReviews();
      setEditingReview(null);
      setIsReviewFormOpen(false);
      setReviewMessage("Review deleted.");
    } catch (error) {
      setReviewError(getReviewErrorMessage(error));
    } finally {
      setSubmittingReview(false);
    }
  }

  async function submitReview(action: () => Promise<void>) {
    try {
      setSubmittingReview(true);
      setReviewError("");
      setReviewMessage("");

      await action();
      await refreshReviews();
      setEditingReview(null);
      setIsReviewFormOpen(false);
    } catch (error) {
      setReviewError(getReviewErrorMessage(error));
    } finally {
      setSubmittingReview(false);
    }
  }

  function openCreateForm() {
    setEditingReview(null);
    setIsReviewFormOpen(true);
    setReviewError("");
    setReviewMessage("");
  }

  function openEditForm(review: ReviewResponse) {
    setEditingReview(review);
    setIsReviewFormOpen(true);
    setReviewError("");
    setReviewMessage("");
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="review-modal" onClick={(event) => event.stopPropagation()}>
        <button
          className="modal-close-button"
          onClick={onClose}
          aria-label="Close title details"
        >
          x
        </button>

        <div className="modal-content">
          <img src={getPosterSrc(title.posterPath)} alt={title.name} />
          <div>
            <p className="eyebrow">{title.type}</p>
            <h2>{title.name}</h2>
            {title.originalName && title.originalName !== title.name && (
              <p className="modal-meta">{title.originalName}</p>
            )}
            <p className="modal-meta">
              {title.genres.map((genre) => genre.name).join(" / ") || "No genre"}{" "}
              | {title.releaseDate || "Release date TBA"}
            </p>
            <p className="modal-meta">
              {title.runtimeMinutes ? `${title.runtimeMinutes} min` : "Runtime TBA"}{" "}
              | {title.originalLanguage || "Language TBA"} |{" "}
              {title.country || "Country TBA"}
            </p>
            {title.tmdbVoteAverage !== null && (
              <p className="rating">
                TMDb {title.tmdbVoteAverage.toFixed(1)}/10
                {title.tmdbVoteCount !== null ? ` (${title.tmdbVoteCount} votes)` : ""}
              </p>
            )}
            {title.moodTags.length > 0 && (
              <p className="mood-tags">
                {title.moodTags.map((moodTag) => moodTag.name).join(" / ")}
              </p>
            )}
            <h3>Overview</h3>
            <p className="review-text">{title.overview || "No overview available yet."}</p>
          </div>
        </div>

        <section className="reviews-section">
          <div className="reviews-header">
            <div>
              <p className="eyebrow">Community reviews</p>
              <h3>{visibleReviews.length} visible reviews</h3>
            </div>

            {authState && !ownReview && !isReviewFormOpen && (
              <button className="review-action-button" onClick={openCreateForm}>
                Write review
              </button>
            )}
          </div>

          {!authState && (
            <p className="review-login-note">Log in to write your own review.</p>
          )}

          {authState && ownReview && !isReviewFormOpen && (
            <div className="own-review-bar">
              <span>You have reviewed this title.</span>
              <div>
                <button onClick={() => openEditForm(ownReview)}>Edit</button>
                <button onClick={() => handleDeleteReview(ownReview)}>Delete</button>
              </div>
            </div>
          )}

          {isReviewFormOpen && (
            <ReviewForm
              key={editingReview ? `edit-${editingReview.id}` : "create-review"}
              mode={editingReview ? "edit" : "create"}
              initialReview={editingReview ?? undefined}
              submitting={submittingReview}
              onCancel={() => {
                setEditingReview(null);
                setIsReviewFormOpen(false);
              }}
              onSubmit={editingReview ? handleUpdateReview : handleCreateReview}
            />
          )}

          {reviewMessage && <p className="form-success">{reviewMessage}</p>}
          {reviewError && <p className="form-error">{reviewError}</p>}

          {loadingReviews ? (
            <p className="review-empty">Loading reviews...</p>
          ) : visibleReviews.length === 0 ? (
            <p className="review-empty">No visible reviews yet.</p>
          ) : (
            <div className="review-list">
              {visibleReviews.map((review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  canManage={authState?.user.id === review.user.id}
                  onEdit={() => openEditForm(review)}
                  onDelete={() => handleDeleteReview(review)}
                />
              ))}
            </div>
          )}

          {hiddenOwnReview && (
            <div className="review-list">
              <ReviewItem
                review={hiddenOwnReview}
                canManage
                onEdit={() => openEditForm(hiddenOwnReview)}
                onDelete={() => handleDeleteReview(hiddenOwnReview)}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ReviewForm({
  mode,
  initialReview,
  submitting,
  onCancel,
  onSubmit,
}: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>(() => ({
    rating: initialReview?.rating.toString() ?? "8",
    reviewText: initialReview?.reviewText ?? "",
    reviewLanguage: initialReview?.reviewLanguage ?? "",
    containsSpoiler: Boolean(initialReview?.containsSpoiler),
  }));

  function updateField<Key extends keyof ReviewFormData>(
    key: Key,
    value: ReviewFormData[Key]
  ) {
    setFormData((currentData) => ({
      ...currentData,
      [key]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(formData);
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <label>
        Rating
        <input
          type="number"
          min="0"
          max="10"
          step="0.5"
          value={formData.rating}
          onChange={(event) => updateField("rating", event.target.value)}
          required
        />
      </label>

      <label>
        Review language
        <input
          value={formData.reviewLanguage}
          onChange={(event) => updateField("reviewLanguage", event.target.value)}
          maxLength={20}
          placeholder="en, th, ja..."
        />
      </label>

      <label className="review-form-full">
        Review
        <textarea
          value={formData.reviewText}
          onChange={(event) => updateField("reviewText", event.target.value)}
          maxLength={5000}
        />
      </label>

      <label className="spoiler-checkbox">
        <input
          type="checkbox"
          checked={formData.containsSpoiler}
          onChange={(event) =>
            updateField("containsSpoiler", event.target.checked)
          }
        />
        Contains spoilers
      </label>

      <div className="review-form-actions">
        <button type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" disabled={submitting}>
          {submitting
            ? "Saving..."
            : mode === "edit"
              ? "Update review"
              : "Post review"}
        </button>
      </div>
    </form>
  );
}

function ReviewItem({
  review,
  canManage,
  onEdit,
  onDelete,
}: {
  review: ReviewResponse;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showSpoiler, setShowSpoiler] = useState(false);
  const hasSpoiler = Boolean(review.containsSpoiler);
  const shouldHideText = hasSpoiler && !showSpoiler;

  return (
    <article className="review-item">
      <div className="review-item-header">
        <div>
          <strong>{review.user.displayName || review.user.username}</strong>
          <p>
            {review.rating.toFixed(1)}/10
            {review.reviewLanguage ? ` | ${review.reviewLanguage}` : ""}
            {hasSpoiler ? " | Spoilers" : ""}
          </p>
        </div>

        {canManage && (
          <div className="review-owner-actions">
            <button onClick={onEdit}>Edit</button>
            <button onClick={onDelete}>Delete</button>
          </div>
        )}
      </div>

      {shouldHideText ? (
        <button
          type="button"
          className="spoiler-reveal-button"
          onClick={() => setShowSpoiler(true)}
        >
          Show spoiler review
        </button>
      ) : (
        <p className="review-text">{review.reviewText || "No written review."}</p>
      )}

      <p className="review-timestamp">Updated {formatDate(review.updatedAt)}</p>
    </article>
  );
}

function toReviewRequest(formData: ReviewFormData) {
  return {
    reviewText: toNullableString(formData.reviewText),
    reviewLanguage: toNullableString(formData.reviewLanguage),
    containsSpoiler: formData.containsSpoiler,
  };
}

function toNullableString(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue === "" ? null : trimmedValue;
}

function getReviewErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return "You have already reviewed this title.";
    }

    return error.message;
  }

  return "Could not load or save reviews right now.";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}
