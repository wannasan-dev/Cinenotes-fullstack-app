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
  WatchLogCreateRequest,
  WatchLogResponse,
  WatchLogUpdateRequest,
} from "../types/watchLog";
import type { WatchlistItemResponse, WatchStatus } from "../types/watchlist";
import type { MoodTagResponse, Title } from "../types/title";
import type { TitleFocusIntent } from "../types/titleNavigation";
import { getPosterSrc } from "../utils/poster";
import {
  CalendarIcon,
  CloseIcon,
  HeartIcon,
  HomeIcon,
  RepeatIcon,
  UsersIcon,
} from "./UiIcons";
import {
  getWatchCompanyLabel,
  getWatchPlaceLabel,
  getWatchStatusesForTitle,
  getWatchStatusLabel,
} from "../utils/watchLabels";
import {
  WatchMemoryEditor,
  type WatchMemoryFormData,
} from "./WatchMemoryEditor";

type TitleDetailModalProps = {
  title: Title;
  authState: AuthState | null;
  availableMoods: MoodTagResponse[];
  moodsLoading: boolean;
  moodsError: string;
  focusIntent: TitleFocusIntent | null;
  onWatchDataChanged: () => void;
  onFocusIntentHandled: () => void;
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
  availableMoods,
  moodsLoading,
  moodsError,
  focusIntent,
  onWatchDataChanged,
  onFocusIntentHandled,
  onClose,
}: TitleDetailModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const memoriesSectionRef = useRef<HTMLDivElement>(null);
  const reviewSectionRef = useRef<HTMLDivElement>(null);
  const personalActionsRef = useRef<HTMLElement>(null);
  const watchEditorHeadingRef = useRef<HTMLHeadingElement>(null);
  const reviewEditorHeadingRef = useRef<HTMLHeadingElement>(null);
  const memoryListHeadingRef = useRef<HTMLHeadingElement>(null);
  const logActionRef = useRef<HTMLButtonElement>(null);
  const reviewActionRef = useRef<HTMLButtonElement>(null);
  const watchLogRefs = useRef(new Map<number, HTMLElement>());
  const handledFocusRequestRef = useRef<number | null>(null);
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
  const [loadingWatchData, setLoadingWatchData] = useState(Boolean(authState));
  const [watchError, setWatchError] = useState("");
  const [watchMessage, setWatchMessage] = useState("");
  const [isWatchLogFormOpen, setIsWatchLogFormOpen] = useState(false);
  const [editingWatchLog, setEditingWatchLog] =
    useState<WatchLogResponse | null>(null);
  const [submittingWatch, setSubmittingWatch] = useState(false);
  const [showAllMemories, setShowAllMemories] = useState(
    focusIntent?.focusTarget === "watch-memory" && Boolean(focusIntent.watchLogId)
  );

  const ownReview = useMemo(
    () => currentUserReviews.find((review) => review.titleId === title.id) ?? null,
    [currentUserReviews, title.id]
  );
  const hiddenOwnReview =
    ownReview &&
    !visibleReviews.some((review) => review.id === ownReview.id)
      ? ownReview
      : null;
  const communityReviews = authState
    ? visibleReviews.filter((review) => review.id !== ownReview?.id)
    : visibleReviews;
  const orderedWatchLogs = useMemo(
    () =>
      [...titleWatchLogs].sort((first, second) => {
        const dateOrder = (second.watchedDate ?? "").localeCompare(
          first.watchedDate ?? ""
        );
        return dateOrder !== 0 ? dateOrder : second.id - first.id;
      }),
    [titleWatchLogs]
  );
  const latestWatchLog = orderedWatchLogs[0] ?? null;
  const availableWatchStatuses = getWatchStatusesForTitle(
    title.type,
    watchlistItem?.status
  );
  const hasCineNotesRating =
    title.cinenotesRatingAverage !== null && title.cinenotesRatingCount > 0;

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
    if (!focusIntent || handledFocusRequestRef.current === focusIntent.requestId) return;

    if (focusIntent.focusTarget === "review" && loadingReviews) return;
    if (focusIntent.focusTarget === "watch-memory" && loadingWatchData) return;

    let target: HTMLElement | null;

    if (focusIntent.focusTarget === "review") {
      target = reviewSectionRef.current ?? personalActionsRef.current;
    } else if (focusIntent.watchLogId) {
      const matchingLogExists = orderedWatchLogs.some(
        (log) => log.id === focusIntent.watchLogId
      );
      target = matchingLogExists
        ? watchLogRefs.current.get(focusIntent.watchLogId) ?? null
        : memoriesSectionRef.current ?? personalActionsRef.current;
    } else {
      target = memoriesSectionRef.current ?? personalActionsRef.current;
    }

    if (!target) return;

    handledFocusRequestRef.current = focusIntent.requestId;
    target.focus({ preventScroll: true });
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
    onFocusIntentHandled();
  }, [
    focusIntent,
    loadingReviews,
    loadingWatchData,
    onFocusIntentHandled,
    orderedWatchLogs,
  ]);

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

  async function handleCreateWatchLog(formData: WatchMemoryFormData) {
    if (!authState) return;

    await submitWatchLog(async () => {
      const request: WatchLogCreateRequest = {
        titleId: title.id,
        ...toWatchLogRequest(formData, "create"),
      };

      await createWatchLog(request, authState.token);
      setWatchMessage("Memory saved.");
    });
  }

  async function handleUpdateWatchLog(formData: WatchMemoryFormData) {
    if (!authState || !editingWatchLog) return;

    await submitWatchLog(async () => {
      const request: WatchLogUpdateRequest = toWatchLogRequest(formData, "update");
      await updateWatchLog(editingWatchLog.id, request, authState.token);
      setWatchMessage("Watch memory updated.");
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
      focusDisclosedContent(memoriesSectionRef, personalActionsRef);
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
      focusDisclosedContent(memoriesSectionRef, personalActionsRef);
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
      focusDisclosedContent(personalActionsRef);
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
      focusDisclosedContent(reviewSectionRef, personalActionsRef);
    } catch (error) {
      setReviewError(getReviewErrorMessage(error));
    } finally {
      setSubmittingReview(false);
    }
  }

  function openCreateForm() {
    setEditingWatchLog(null);
    setIsWatchLogFormOpen(false);
    setEditingReview(null);
    setIsReviewFormOpen(true);
    setReviewError("");
    setReviewMessage("");
    focusDisclosedContent(reviewEditorHeadingRef);
  }

  function openEditForm(review: ReviewResponse) {
    setEditingWatchLog(null);
    setIsWatchLogFormOpen(false);
    setEditingReview(review);
    setIsReviewFormOpen(true);
    setReviewError("");
    setReviewMessage("");
    focusDisclosedContent(reviewEditorHeadingRef);
  }

  function openWatchLogForm(log: WatchLogResponse | null = null) {
    setEditingReview(null);
    setIsReviewFormOpen(false);
    setEditingWatchLog(log);
    setIsWatchLogFormOpen(true);
    setWatchError("");
    setWatchMessage("");
    focusDisclosedContent(watchEditorHeadingRef);
  }

  function closeWatchLogForm() {
    setEditingWatchLog(null);
    setIsWatchLogFormOpen(false);
    focusDisclosedContent(logActionRef);
  }

  function closeReviewForm() {
    setEditingReview(null);
    setIsReviewFormOpen(false);
    focusDisclosedContent(reviewSectionRef, reviewActionRef, personalActionsRef);
  }

  function toggleMemories() {
    if (showAllMemories) {
      setShowAllMemories(false);
      return;
    }

    setShowAllMemories(true);
    focusDisclosedContent(memoryListHeadingRef);
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
          <CloseIcon size={19} />
        </button>

        <section className="title-about-section" aria-labelledby={`title-detail-heading-${title.id}`}>
          <p className="eyebrow title-detail-kicker">About this title</p>
          <header className="title-detail-header">
            <img className="title-detail-poster" src={getPosterSrc(title.posterPath)} alt={`${title.name} poster`} />
            <div className="title-detail-identity">
              <p className="title-type">{title.type}</p>
              <h2 id={`title-detail-heading-${title.id}`}>{title.name}</h2>
              {title.originalName && title.originalName !== title.name && (
                <p className="title-original-name">{title.originalName}</p>
              )}
              <div className="title-metadata" aria-label="Title details">
                {title.genres.length > 0 && <span>{title.genres.map((genre) => genre.name).join(", ")}</span>}
                {title.releaseDate && <span>{formatReleaseDate(title.releaseDate)}</span>}
                {title.runtimeMinutes && <span>{title.runtimeMinutes} min</span>}
                {title.originalLanguage && <span>{title.originalLanguage.toUpperCase()}</span>}
                {title.country && <span>{title.country}</span>}
              </div>
              <div className="title-ratings" aria-label="Ratings">
                <div className={hasCineNotesRating ? "rating-summary rating-summary-primary" : "rating-summary"}>
                  <span>CineNotes</span>
                  {hasCineNotesRating && title.cinenotesRatingAverage !== null ? (
                    <>
                      <strong>{title.cinenotesRatingAverage.toFixed(1)} <small>/ 10</small></strong>
                      <p>{formatNumber(title.cinenotesRatingCount)} {title.cinenotesRatingCount === 1 ? "rating" : "ratings"}</p>
                    </>
                  ) : <p>No CineNotes ratings yet</p>}
                </div>
                <div className="rating-summary">
                  <span>TMDb</span>
                  {title.tmdbVoteAverage !== null ? (
                    <>
                      <strong>{title.tmdbVoteAverage.toFixed(1)} <small>/ 10</small></strong>
                      {title.tmdbVoteCount !== null && <p>{formatNumber(title.tmdbVoteCount)} votes</p>}
                    </>
                  ) : <p>Rating unavailable</p>}
                </div>
              </div>
            </div>
          </header>
          <div className="title-overview-section">
            <h3>Overview</h3>
            <p className="review-text">{title.overview || "No overview available yet."}</p>
            {title.moodTags.length > 0 && (
              <div className="title-mood-list" aria-label="Title moods">
                {title.moodTags.map((moodTag) => <span key={moodTag.id}>{moodTag.name}</span>)}
              </div>
            )}
          </div>
        </section>

        {authState && (
          <section className="title-detail-section personal-title-area" aria-label="Personal title actions">
            <section
              ref={personalActionsRef}
              id={`title-personal-actions-${title.id}`}
              className="title-personal-actions"
              tabIndex={-1}
              aria-label="Personal actions"
            >
              {!isWatchLogFormOpen && !isReviewFormOpen && (
                <button
                  ref={logActionRef}
                  className="primary-personal-action"
                  type="button"
                  disabled={submittingWatch}
                  onClick={() => openWatchLogForm()}
                >
                  Log a watch
                </button>
              )}

              {!loadingReviews && !ownReview && !isReviewFormOpen && !isWatchLogFormOpen && (
                <button ref={reviewActionRef} className="secondary-personal-action" type="button" onClick={openCreateForm}>
                  Write a review
                </button>
              )}

              {!loadingWatchData && !watchlistItem && (
                <button
                  className="secondary-personal-action"
                  type="button"
                  disabled={submittingWatch}
                  onClick={() => handleUpsertWatchlistItem("WANT_TO_WATCH", false)}
                >
                  Add to watchlist
                </button>
              )}

              {!loadingWatchData && watchlistItem && (
                <label className="compact-status-control">
                  <span>Status</span>
                  <select
                    value={watchlistItem.status}
                    disabled={submittingWatch}
                    onChange={(event) => handleUpsertWatchlistItem(event.target.value as WatchStatus, Boolean(watchlistItem.favorite))}
                  >
                    {availableWatchStatuses.map((status) => (
                      <option
                        key={status}
                        value={status}
                        disabled={title.type === "MOVIE" && status === "WATCHING"}
                      >
                        {title.type === "MOVIE" && status === "WATCHING"
                          ? "Watching — choose another status"
                          : getWatchStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                  {title.type === "MOVIE" && watchlistItem.status === "WATCHING" && (
                    <span className="status-compatibility-note">
                      Watching is no longer used for movies. Choose another status to update it.
                    </span>
                  )}
                </label>
              )}

              {!loadingWatchData && (
                <button
                  className={watchlistItem?.favorite ? "favorite-personal-action active" : "favorite-personal-action"}
                  type="button"
                  aria-pressed={Boolean(watchlistItem?.favorite)}
                  disabled={submittingWatch}
                  onClick={() => handleUpsertWatchlistItem(
                    watchlistItem?.status ?? "WANT_TO_WATCH",
                    !watchlistItem?.favorite
                  )}
                >
                  <HeartIcon size={17} filled={Boolean(watchlistItem?.favorite)} />
                  {watchlistItem?.favorite ? "Favorited" : "Favorite"}
                </button>
              )}

              {!loadingWatchData && watchlistItem && (
                <button
                  className="remove-watchlist-action"
                  type="button"
                  disabled={submittingWatch}
                  onClick={handleRemoveWatchlistItem}
                >
                  Remove from watchlist
                </button>
              )}
            </section>

            {isWatchLogFormOpen && (
              <section className="focused-personal-editor" aria-labelledby={`watch-editor-heading-${title.id}`}>
                <WatchMemoryEditor
                  key={editingWatchLog ? `edit-watch-log-${editingWatchLog.id}` : "create-watch-log"}
                  mode={editingWatchLog ? "edit" : "create"}
                  availableMoods={availableMoods}
                  moodsLoading={moodsLoading}
                  moodsError={moodsError}
                  initialLog={editingWatchLog ?? undefined}
                  submitting={submittingWatch}
                  error={watchError}
                  headingId={`watch-editor-heading-${title.id}`}
                  headingRef={watchEditorHeadingRef}
                  onCancel={closeWatchLogForm}
                  onSubmit={editingWatchLog ? handleUpdateWatchLog : handleCreateWatchLog}
                />
              </section>
            )}

            {watchMessage && <p className="form-success personal-title-feedback" role="status">{watchMessage}</p>}
            {watchError && !isWatchLogFormOpen && <p className="form-error personal-title-feedback" role="alert">{watchError}</p>}

            {!isReviewFormOpen && !loadingWatchData && orderedWatchLogs.length > 0 && latestWatchLog && (
              <div
                ref={memoriesSectionRef}
                id={`title-watch-memories-${title.id}`}
                className="personal-content-summary memories-summary"
                tabIndex={-1}
                aria-labelledby={`title-watch-memories-heading-${title.id}`}
              >
                <div className="personal-summary-heading">
                  <div>
                    <h3 id={`title-watch-memories-heading-${title.id}`}>Your watch memories</h3>
                    <p>{orderedWatchLogs.length} {orderedWatchLogs.length === 1 ? "memory" : "memories"}</p>
                  </div>
                  <button
                    className="text-action"
                    type="button"
                    aria-expanded={showAllMemories}
                    aria-controls={`title-watch-memory-list-${title.id}`}
                    onClick={toggleMemories}
                  >
                    {showAllMemories ? "Hide memories" : "View memories"}
                  </button>
                </div>

                {!showAllMemories && (
                  <div className="latest-memory-preview">
                    <p>{latestWatchLog.watchedDate ? `Latest · ${formatWatchDate(latestWatchLog.watchedDate)}` : "Latest memory"}</p>
                    {latestWatchLog.memoryNote && <blockquote>{latestWatchLog.memoryNote}</blockquote>}
                  </div>
                )}

                <div
                  id={`title-watch-memory-list-${title.id}`}
                  className="expanded-memory-list"
                  hidden={!showAllMemories}
                >
                  {showAllMemories && (
                    <>
                    <h4 ref={memoryListHeadingRef} tabIndex={-1}>Watch memories</h4>
                    <div className="watch-log-list compact">
                      {orderedWatchLogs.map((log) => (
                        <WatchLogItem
                          key={log.id}
                          log={log}
                          elementRef={(element) => {
                            if (element) watchLogRefs.current.set(log.id, element);
                            else watchLogRefs.current.delete(log.id);
                          }}
                          onEdit={() => openWatchLogForm(log)}
                          onDelete={() => handleDeleteWatchLog(log)}
                        />
                      ))}
                    </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {!isWatchLogFormOpen && (ownReview || isReviewFormOpen) && (
              <div
                ref={reviewSectionRef}
                id={`title-your-review-${title.id}`}
                className="personal-content-summary personal-review-summary"
                tabIndex={-1}
                aria-labelledby={`title-your-review-heading-${title.id}`}
              >
                {isReviewFormOpen ? (
                  <section className="focused-personal-editor review-editor" aria-labelledby={`title-your-review-heading-${title.id}`}>
                    <header>
                      <h3 ref={reviewEditorHeadingRef} id={`title-your-review-heading-${title.id}`} tabIndex={-1}>
                        {editingReview ? "Edit your review" : "Write your review"}
                      </h3>
                    </header>
                    <ReviewForm
                      key={editingReview ? `edit-${editingReview.id}` : "create-review"}
                      mode={editingReview ? "edit" : "create"}
                      initialReview={editingReview ?? undefined}
                      submitting={submittingReview}
                      onCancel={closeReviewForm}
                      onSubmit={editingReview ? handleUpdateReview : handleCreateReview}
                    />
                  </section>
                ) : ownReview ? (
                  <OwnReviewSummary
                    review={hiddenOwnReview ?? ownReview}
                    headingId={`title-your-review-heading-${title.id}`}
                    onEdit={() => openEditForm(ownReview)}
                    onDelete={() => handleDeleteReview(ownReview)}
                  />
                ) : null}
              </div>
            )}

            {reviewMessage && <p className="form-success personal-title-feedback" role="status">{reviewMessage}</p>}
            {reviewError && <p className="form-error personal-title-feedback" role="alert">{reviewError}</p>}
          </section>
        )}

        <section className="title-detail-section reviews-section">
          <div className="section-heading">
            <div>
              <h3>Community reviews</h3>
              {!loadingReviews && <p className="section-count">{communityReviews.length} {communityReviews.length === 1 ? "review" : "reviews"}</p>}
            </div>
          </div>
          {!authState && <p className="review-login-note">Log in to write your own review.</p>}
          {!authState && reviewError && <p className="form-error" role="alert">{reviewError}</p>}
          {loadingReviews ? (
            <p className="review-empty">Loading community reviews...</p>
          ) : communityReviews.length === 0 ? (
            <p className="review-empty">No community reviews yet.</p>
          ) : (
            <div className="review-list">
              {communityReviews.map((review) => (
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
  hideReviewer = false,
  canManage,
  canModerate,
  onEdit,
  onDelete,
  onHide,
}: {
  review: ReviewResponse;
  hideReviewer?: boolean;
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
          {!hideReviewer && <strong>{review.user.displayName || review.user.username}</strong>}
          <p>
            {review.rating.toFixed(1)} / 10
          </p>
        </div>

        {(canManage || canModerate) && (
          <div className="review-owner-actions">
            {canManage && (
              <>
                <button onClick={onEdit}>Edit</button>
                <button className="delete-action" onClick={onDelete}>Delete</button>
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

      <div className="review-card-meta">
        {hasSpoiler && <span>Spoilers</span>}
        {review.reviewLanguage && <span>{review.reviewLanguage.toUpperCase()}</span>}
        <span>Updated {formatDate(review.updatedAt)}</span>
      </div>
    </article>
  );
}

function OwnReviewSummary({
  review,
  headingId,
  onEdit,
  onDelete,
}: {
  review: ReviewResponse;
  headingId: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="own-review-summary">
      <div className="own-review-summary-heading">
        <div>
          <h3 id={headingId}>Your review</h3>
          <strong>{review.rating.toFixed(1)} / 10</strong>
        </div>
        <div className="own-review-summary-actions">
          <button type="button" onClick={onEdit}>Edit review</button>
          <button className="delete-action" type="button" onClick={onDelete}>Delete</button>
        </div>
      </div>
      {review.reviewText && <p>{review.reviewText}</p>}
      <div className="review-card-meta">
        {review.containsSpoiler && <span>Spoilers</span>}
        <span>Updated {formatDate(review.updatedAt)}</span>
      </div>
    </article>
  );
}

function WatchLogItem({
  log,
  elementRef,
  onEdit,
  onDelete,
}: {
  log: WatchLogResponse;
  elementRef?: (element: HTMLElement | null) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      ref={elementRef}
      id={`watch-memory-${log.id}`}
      className="watch-log-item compact memory-entry"
      tabIndex={-1}
      aria-label={`Watch memory from ${log.watchedDate ? formatWatchDate(log.watchedDate) : "an unknown date"}`}
    >
      <div className="watch-log-header">
        <div>
          {log.watchedDate && (
            <p className="memory-entry-date"><CalendarIcon size={18} /> <strong>Watched {formatWatchDate(log.watchedDate)}</strong></p>
          )}
          <div className="memory-entry-facts">
            {log.watchPlace && <span><HomeIcon size={17} />{getWatchPlaceLabel(log.watchPlace)}</span>}
            {log.watchCompany && <span><UsersIcon size={17} />With {getWatchCompanyLabel(log.watchCompany).toLowerCase()}</span>}
            {log.rewatch && <span><RepeatIcon size={17} />Rewatch</span>}
          </div>
        </div>

        <div className="watch-log-actions">
          <button onClick={onEdit}>Edit</button>
          <button className="delete-action" onClick={onDelete}>Delete</button>
        </div>
      </div>

      {log.moods.length > 0 && (
        <div className="memory-moods" aria-label="Moods">
          {log.moods.map((mood) => <span key={mood.id}>{mood.name}</span>)}
        </div>
      )}
      {log.memoryNote && (
        <blockquote className="memory-note">
          <span>Memory</span>
          <p>{log.memoryNote}</p>
        </blockquote>
      )}
    </article>
  );
}

function focusDisclosedContent(
  ...refs: Array<{ current: HTMLElement | null }>
) {
  window.setTimeout(() => {
    const target = refs.find((ref) => ref.current)?.current;
    if (!target) return;

    target.focus({ preventScroll: true });
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }, 0);
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
  formData: WatchMemoryFormData,
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

function formatWatchDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(`${value}T00:00:00`)
  );
}

function formatReleaseDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}
