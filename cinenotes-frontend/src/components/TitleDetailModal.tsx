import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  createReview,
  deleteReview,
  fetchCurrentUserReviews,
  fetchVisibleReviewsByTitle,
  updateReview,
} from "../api/reviewApi";
import { hideAdminReview } from "../api/adminReviewApi";
import {
  fetchCurrentUserWatchlistItemByTitle,
  removeWatchlistItemByTitle,
  upsertWatchlistItem,
} from "../api/watchlistApi";
import {
  createWatchLog,
  deleteWatchLog,
  fetchCurrentUserWatchLogsByTitle,
  updateWatchLog,
} from "../api/watchLogApi";
import { ApiError } from "../api/apiClient";
import type { AuthState } from "../types/auth";
import type {
  ReviewCreateRequest,
  ReviewResponse,
  ReviewUpdateRequest,
} from "../types/review";
import type {
  WatchCompany,
  WatchLogCreateRequest,
  WatchLogResponse,
  WatchLogUpdateRequest,
  WatchPlace,
} from "../types/watchLog";
import type { WatchlistItemResponse, WatchStatus } from "../types/watchlist";
import type { Title } from "../types/title";
import { getPosterSrc } from "../utils/poster";
import {
  getWatchCompanyLabel,
  getWatchPlaceLabel,
  getWatchStatusLabel,
  WATCH_COMPANIES,
  WATCH_PLACES,
  WATCH_STATUSES,
} from "../utils/watchLabels";

type TitleDetailModalProps = {
  title: Title;
  authState: AuthState | null;
  onWatchDataChanged: () => void;
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

type WatchLogFormData = {
  watchedDate: string;
  watchPlace: "" | WatchPlace;
  watchCompany: "" | WatchCompany;
  rewatch: boolean;
  memoryNote: string;
  moodTagIds: number[];
};

type WatchLogFormProps = {
  mode: "create" | "edit";
  title: Title;
  initialLog?: WatchLogResponse;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (formData: WatchLogFormData) => void;
};

export function TitleDetailModal({
  title,
  authState,
  onWatchDataChanged,
  onClose,
}: TitleDetailModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [visibleReviews, setVisibleReviews] = useState<ReviewResponse[]>([]);
  const [currentUserReviews, setCurrentUserReviews] = useState<ReviewResponse[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [watchlistItem, setWatchlistItem] =
    useState<WatchlistItemResponse | null>(null);
  const [titleWatchLogs, setTitleWatchLogs] = useState<WatchLogResponse[]>([]);
  const [loadingWatchData, setLoadingWatchData] = useState(false);
  const [watchError, setWatchError] = useState("");
  const [watchMessage, setWatchMessage] = useState("");
  const [isWatchLogFormOpen, setIsWatchLogFormOpen] = useState(false);
  const [editingWatchLog, setEditingWatchLog] =
    useState<WatchLogResponse | null>(null);
  const [submittingWatch, setSubmittingWatch] = useState(false);

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
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleDialogKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        )
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleDialogKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleDialogKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

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

  useEffect(() => {
    async function loadWatchData() {
      if (!authState) {
        setWatchlistItem(null);
        setTitleWatchLogs([]);
        return;
      }

      try {
        setLoadingWatchData(true);
        setWatchError("");

        const [watchlistItemResult, watchLogs] = await Promise.all([
          fetchWatchlistItemOrNull(title.id, authState.token),
          fetchCurrentUserWatchLogsByTitle(title.id, authState.token),
        ]);

        setWatchlistItem(watchlistItemResult);
        setTitleWatchLogs(watchLogs);
      } catch (error) {
        setWatchError(getWatchErrorMessage(error));
      } finally {
        setLoadingWatchData(false);
      }
    }

    loadWatchData();
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

  async function refreshWatchData() {
    if (!authState) return;

    const [watchlistItemResult, watchLogs] = await Promise.all([
      fetchWatchlistItemOrNull(title.id, authState.token),
      fetchCurrentUserWatchLogsByTitle(title.id, authState.token),
    ]);

    setWatchlistItem(watchlistItemResult);
    setTitleWatchLogs(watchLogs);
    onWatchDataChanged();
  }

  async function handleUpsertWatchlistItem(
    status: WatchStatus,
    favorite: boolean
  ) {
    if (!authState) return;

    try {
      setSubmittingWatch(true);
      setWatchError("");
      setWatchMessage("");

      const updatedItem = await upsertWatchlistItem(
        {
          titleId: title.id,
          status,
          favorite,
        },
        authState.token
      );

      setWatchlistItem(updatedItem);
      onWatchDataChanged();
      setWatchMessage("Watchlist updated.");
    } catch (error) {
      setWatchError(getWatchErrorMessage(error));
    } finally {
      setSubmittingWatch(false);
    }
  }

  async function handleRemoveWatchlistItem() {
    if (!authState) return;

    try {
      setSubmittingWatch(true);
      setWatchError("");
      setWatchMessage("");

      await removeWatchlistItemByTitle(title.id, authState.token);
      setWatchlistItem(null);
      onWatchDataChanged();
      setWatchMessage("Removed from watchlist.");
    } catch (error) {
      setWatchError(getWatchErrorMessage(error));
    } finally {
      setSubmittingWatch(false);
    }
  }

  async function handleCreateWatchLog(formData: WatchLogFormData) {
    if (!authState) return;

    await submitWatchLog(async () => {
      const request: WatchLogCreateRequest = {
        titleId: title.id,
        ...toWatchLogRequest(formData, "create"),
      };

      await createWatchLog(request, authState.token);
      setWatchMessage("Watch logged.");
    });
  }

  async function handleUpdateWatchLog(formData: WatchLogFormData) {
    if (!authState || !editingWatchLog) return;

    await submitWatchLog(async () => {
      const request: WatchLogUpdateRequest = toWatchLogRequest(formData, "update");
      await updateWatchLog(editingWatchLog.id, request, authState.token);
      setWatchMessage("Watch log updated.");
    });
  }

  async function handleDeleteWatchLog(log: WatchLogResponse) {
    if (!authState) return;

    const shouldDelete = window.confirm("Delete this watch log?");
    if (!shouldDelete) return;

    try {
      setSubmittingWatch(true);
      setWatchError("");
      setWatchMessage("");

      await deleteWatchLog(log.id, authState.token);
      await refreshWatchData();
      setEditingWatchLog(null);
      setIsWatchLogFormOpen(false);
      setWatchMessage("Watch log deleted.");
    } catch (error) {
      setWatchError(getWatchErrorMessage(error));
    } finally {
      setSubmittingWatch(false);
    }
  }

  async function submitWatchLog(action: () => Promise<void>) {
    try {
      setSubmittingWatch(true);
      setWatchError("");
      setWatchMessage("");

      await action();
      await refreshWatchData();
      setEditingWatchLog(null);
      setIsWatchLogFormOpen(false);
    } catch (error) {
      setWatchError(getWatchErrorMessage(error));
    } finally {
      setSubmittingWatch(false);
    }
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

  async function handleHideReview(review: ReviewResponse) {
    if (!authState || authState.user.role !== "ADMIN") return;

    try {
      setSubmittingReview(true);
      setReviewError("");
      setReviewMessage("");

      await hideAdminReview(review.id, authState.token);
      await refreshReviews();
      setReviewMessage("Review hidden.");
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
      <div
        ref={dialogRef}
        className="review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`title-detail-heading-${title.id}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
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
            <h2 id={`title-detail-heading-${title.id}`}>{title.name}</h2>
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

        <section className="watch-detail-section">
          <div className="reviews-header">
            <div>
              <p className="eyebrow">Your watching</p>
              <h3>Watchlist and logs</h3>
            </div>

            {authState && !isWatchLogFormOpen && (
              <button
                className="review-action-button"
                onClick={() => {
                  setEditingWatchLog(null);
                  setIsWatchLogFormOpen(true);
                  setWatchError("");
                  setWatchMessage("");
                }}
              >
                Log watch
              </button>
            )}
          </div>

          {!authState ? (
            <p className="review-login-note">
              Log in to manage your watchlist and watch history.
            </p>
          ) : (
            <>
              <div className="watchlist-controls">
                <label>
                  Watch status
                  <select
                    value={watchlistItem?.status ?? "WANT_TO_WATCH"}
                    disabled={submittingWatch}
                    onChange={(event) =>
                      handleUpsertWatchlistItem(
                        event.target.value as WatchStatus,
                        Boolean(watchlistItem?.favorite)
                      )
                    }
                  >
                    {WATCH_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {getWatchStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="inline-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(watchlistItem?.favorite)}
                    disabled={submittingWatch}
                    onChange={(event) =>
                      handleUpsertWatchlistItem(
                        watchlistItem?.status ?? "WANT_TO_WATCH",
                        event.target.checked
                      )
                    }
                  />
                  Favorite
                </label>

                {!watchlistItem ? (
                  <button
                    type="button"
                    onClick={() => handleUpsertWatchlistItem("WANT_TO_WATCH", false)}
                    disabled={submittingWatch}
                  >
                    Add to watchlist
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRemoveWatchlistItem}
                    disabled={submittingWatch}
                  >
                    Remove
                  </button>
                )}
              </div>

              {isWatchLogFormOpen && (
                <WatchLogForm
                  key={
                    editingWatchLog
                      ? `edit-watch-log-${editingWatchLog.id}`
                      : "create-watch-log"
                  }
                  mode={editingWatchLog ? "edit" : "create"}
                  title={title}
                  initialLog={editingWatchLog ?? undefined}
                  submitting={submittingWatch}
                  onCancel={() => {
                    setEditingWatchLog(null);
                    setIsWatchLogFormOpen(false);
                  }}
                  onSubmit={
                    editingWatchLog ? handleUpdateWatchLog : handleCreateWatchLog
                  }
                />
              )}

              {watchMessage && <p className="form-success">{watchMessage}</p>}
              {watchError && <p className="form-error">{watchError}</p>}

              {loadingWatchData ? (
                <p className="watch-empty">Loading your watch data...</p>
              ) : titleWatchLogs.length === 0 ? (
                <p className="watch-empty">No watch logs for this title yet.</p>
              ) : (
                <div className="watch-log-list compact">
                  {titleWatchLogs.map((log) => (
                    <WatchLogItem
                      key={log.id}
                      log={log}
                      onEdit={() => {
                        setEditingWatchLog(log);
                        setIsWatchLogFormOpen(true);
                      }}
                      onDelete={() => handleDeleteWatchLog(log)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>

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
                  canModerate={authState?.user.role === "ADMIN"}
                  onEdit={() => openEditForm(review)}
                  onDelete={() => handleDeleteReview(review)}
                  onHide={() => handleHideReview(review)}
                />
              ))}
            </div>
          )}

          {hiddenOwnReview && (
            <div className="review-list">
              <ReviewItem
                review={hiddenOwnReview}
                canManage
                canModerate={authState?.user.role === "ADMIN"}
                onEdit={() => openEditForm(hiddenOwnReview)}
                onDelete={() => handleDeleteReview(hiddenOwnReview)}
                onHide={() => handleHideReview(hiddenOwnReview)}
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
  canModerate,
  onEdit,
  onDelete,
  onHide,
}: {
  review: ReviewResponse;
  canManage: boolean;
  canModerate: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onHide: () => void;
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

        {(canManage || canModerate) && (
          <div className="review-owner-actions">
            {canManage && (
              <>
                <button onClick={onEdit}>Edit</button>
                <button onClick={onDelete}>Delete</button>
              </>
            )}
            {canModerate && review.visible !== false && (
              <button onClick={onHide}>Hide</button>
            )}
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

function WatchLogForm({
  mode,
  title,
  initialLog,
  submitting,
  onCancel,
  onSubmit,
}: WatchLogFormProps) {
  const [formData, setFormData] = useState<WatchLogFormData>(() => ({
    watchedDate: initialLog?.watchedDate ?? new Date().toISOString().slice(0, 10),
    watchPlace: initialLog?.watchPlace ?? "",
    watchCompany: initialLog?.watchCompany ?? "",
    rewatch: Boolean(initialLog?.rewatch),
    memoryNote: initialLog?.memoryNote ?? "",
    moodTagIds: initialLog?.moods.map((mood) => mood.id) ?? [],
  }));

  function updateField<Key extends keyof WatchLogFormData>(
    key: Key,
    value: WatchLogFormData[Key]
  ) {
    setFormData((currentData) => ({
      ...currentData,
      [key]: value,
    }));
  }

  function toggleMood(id: number) {
    setFormData((currentData) => ({
      ...currentData,
      moodTagIds: currentData.moodTagIds.includes(id)
        ? currentData.moodTagIds.filter((moodId) => moodId !== id)
        : [...currentData.moodTagIds, id],
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(formData);
  }

  return (
    <form className="watch-log-form" onSubmit={handleSubmit}>
      <label>
        Watched date
        <input
          type="date"
          value={formData.watchedDate}
          onChange={(event) => updateField("watchedDate", event.target.value)}
        />
      </label>

      <label>
        Place
        <select
          value={formData.watchPlace}
          onChange={(event) =>
            updateField("watchPlace", event.target.value as "" | WatchPlace)
          }
        >
          <option value="">Not set</option>
          {WATCH_PLACES.map((place) => (
            <option key={place} value={place}>
              {getWatchPlaceLabel(place)}
            </option>
          ))}
        </select>
      </label>

      <label>
        Company
        <select
          value={formData.watchCompany}
          onChange={(event) =>
            updateField("watchCompany", event.target.value as "" | WatchCompany)
          }
        >
          <option value="">Not set</option>
          {WATCH_COMPANIES.map((company) => (
            <option key={company} value={company}>
              {getWatchCompanyLabel(company)}
            </option>
          ))}
        </select>
      </label>

      <label className="inline-checkbox">
        <input
          type="checkbox"
          checked={formData.rewatch}
          onChange={(event) => updateField("rewatch", event.target.checked)}
        />
        Rewatch
      </label>

      <label className="watch-log-form-full">
        Memory note
        <textarea
          value={formData.memoryNote}
          onChange={(event) => updateField("memoryNote", event.target.value)}
          maxLength={5000}
        />
      </label>

      {title.moodTags.length > 0 && (
        <fieldset className="watch-log-form-full option-fieldset">
          <legend>Moods</legend>
          {title.moodTags.map((mood) => (
            <label key={mood.id} className="checkbox-option">
              <input
                type="checkbox"
                checked={formData.moodTagIds.includes(mood.id)}
                onChange={() => toggleMood(mood.id)}
              />
              {mood.name}
            </label>
          ))}
        </fieldset>
      )}

      <div className="watch-log-form-actions">
        <button type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" disabled={submitting}>
          {submitting
            ? "Saving..."
            : mode === "edit"
              ? "Update log"
              : "Save log"}
        </button>
      </div>
    </form>
  );
}

function WatchLogItem({
  log,
  onEdit,
  onDelete,
}: {
  log: WatchLogResponse;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="watch-log-item compact">
      <div className="watch-log-header">
        <div>
          <strong>{log.watchedDate || "Date not set"}</strong>
          <p>
            {log.watchPlace ? getWatchPlaceLabel(log.watchPlace) : "Place not set"}{" "}
            |{" "}
            {log.watchCompany
              ? getWatchCompanyLabel(log.watchCompany)
              : "Company not set"}
            {log.rewatch ? " | Rewatch" : ""}
          </p>
        </div>

        <div className="watch-log-actions">
          <button onClick={onEdit}>Edit</button>
          <button onClick={onDelete}>Delete</button>
        </div>
      </div>

      {log.memoryNote && <p className="review-text">{log.memoryNote}</p>}
      {log.moods.length > 0 && (
        <p className="mood-tags">{log.moods.map((mood) => mood.name).join(" / ")}</p>
      )}
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

function toWatchLogRequest(
  formData: WatchLogFormData,
  mode: "create" | "update"
) {
  return {
    watchedDate: formData.watchedDate === "" ? null : formData.watchedDate,
    watchPlace: formData.watchPlace === "" ? null : formData.watchPlace,
    watchCompany:
      formData.watchCompany === "" ? null : formData.watchCompany,
    rewatch: formData.rewatch,
    memoryNote: formData.memoryNote,
    moodTagIds:
      mode === "create" && formData.moodTagIds.length === 0
        ? null
        : formData.moodTagIds,
  };
}

async function fetchWatchlistItemOrNull(titleId: number, token: string) {
  try {
    return await fetchCurrentUserWatchlistItemByTitle(titleId, token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

function getWatchErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Could not load or save watch data right now.";
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
