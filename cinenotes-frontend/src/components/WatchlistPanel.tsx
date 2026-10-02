import { useEffect, useState } from "react";
import { ApiError } from "../api/apiClient";
import {
  fetchCurrentUserWatchlist,
  removeWatchlistItemByTitle,
  upsertWatchlistItem,
} from "../api/watchlistApi";
import type { WatchlistItemResponse, WatchStatus } from "../types/watchlist";
import { getPosterSrc } from "../utils/poster";
import { getWatchStatusLabel, WATCH_STATUSES } from "../utils/watchLabels";
import { HeartIcon } from "./UiIcons";

type WatchlistPanelProps = {
  authToken: string;
  refreshKey: number;
  onChanged: () => void;
  onDiscoverTitles: () => void;
  onOpenTitle: (titleId: number) => Promise<void>;
};

export function WatchlistPanel({
  authToken,
  refreshKey,
  onChanged,
  onDiscoverTitles,
  onOpenTitle,
}: WatchlistPanelProps) {
  const [items, setItems] = useState<WatchlistItemResponse[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | WatchStatus>("ALL");
  const [busyItemId, setBusyItemId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWatchlist() {
      try {
        setLoading(true);
        setError("");
        setItems(await fetchCurrentUserWatchlist(authToken));
      } catch (loadError) {
        setError(getWatchErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    }

    loadWatchlist();
  }, [authToken, refreshKey]);

  const filteredItems = selectedStatus === "ALL"
    ? items
    : items.filter((item) => item.status === selectedStatus);

  async function updateItem(
    item: WatchlistItemResponse,
    nextStatus: WatchStatus,
    favorite: boolean
  ) {
    if (busyItemId !== null) return;

    try {
      setBusyItemId(item.id);
      setError("");
      const updatedItem = await upsertWatchlistItem(
        { titleId: item.title.id, status: nextStatus, favorite },
        authToken
      );

      setItems((currentItems) => currentItems.map((currentItem) =>
        currentItem.id === updatedItem.id ? updatedItem : currentItem
      ));
      onChanged();
    } catch (updateError) {
      setError(getWatchErrorMessage(updateError));
    } finally {
      setBusyItemId(null);
    }
  }

  async function removeItem(item: WatchlistItemResponse) {
    if (busyItemId !== null) return;

    try {
      setBusyItemId(item.id);
      setError("");
      await removeWatchlistItemByTitle(item.title.id, authToken);
      setItems((currentItems) => currentItems.filter((currentItem) => currentItem.id !== item.id));
      onChanged();
    } catch (removeError) {
      setError(getWatchErrorMessage(removeError));
    } finally {
      setBusyItemId(null);
    }
  }

  async function openTitle(titleId: number) {
    try {
      setError("");
      await onOpenTitle(titleId);
    } catch (openError) {
      setError(getWatchErrorMessage(openError));
    }
  }

  return (
    <section className="collection-page watchlist-page" aria-labelledby="watchlist-heading">
      <header className="collection-page-header">
        <div>
          <h1 id="watchlist-heading">My Watchlist</h1>
          <p>Movies and series you&apos;re planning to watch.</p>
        </div>

        {items.length > 0 && (
          <label className="collection-filter">
            <span>Show</span>
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value as "ALL" | WatchStatus)}
            >
              <option value="ALL">All statuses</option>
              {WATCH_STATUSES.map((status) => (
                <option key={status} value={status}>{getWatchStatusLabel(status)}</option>
              ))}
            </select>
          </label>
        )}
      </header>

      {error && <p className="form-error collection-error" role="alert">{error}</p>}
      {loading && <CollectionLoadingState />}

      {!loading && items.length === 0 ? (
        <div className="collection-empty-state">
          <h2>Nothing waiting yet.</h2>
          <p>Start collecting movies and series you want to watch.</p>
          <button type="button" onClick={onDiscoverTitles}>Discover titles</button>
        </div>
      ) : !loading && filteredItems.length === 0 ? (
        <p className="collection-filter-empty">No titles match this status.</p>
      ) : !loading ? (
        <div className="collection-grid watchlist-collection-grid">
          {filteredItems.map((item) => {
            const busy = busyItemId === item.id;
            return (
              <article className="collection-card watchlist-collection-card" key={item.id}>
                <button className="collection-poster-button" type="button" onClick={() => openTitle(item.title.id)} aria-label={`Open ${item.title.name}`}>
                  <img src={getPosterSrc(item.title.posterPath)} alt={`${item.title.name} poster`} />
                </button>

                <div className="collection-card-content">
                  <h2>{item.title.name}</h2>
                  <p className="collection-title-meta">
                    <span>{getReleaseYear(item.title.releaseDate)}</span>
                    <span>{formatTitleType(item.title.type)}</span>
                  </p>
                  <p className="collection-added-date">Added {formatDate(item.createdAt)}</p>

                  <label className="collection-status-control">
                    <span className="sr-only">Watch status for {item.title.name}</span>
                    <select
                      value={item.status}
                      disabled={busy}
                      onChange={(event) => updateItem(item, event.target.value as WatchStatus, Boolean(item.favorite))}
                    >
                      {WATCH_STATUSES.map((status) => (
                        <option key={status} value={status}>{getWatchStatusLabel(status)}</option>
                      ))}
                    </select>
                  </label>

                  <div className="collection-card-actions">
                    <button className="collection-open-action" type="button" onClick={() => openTitle(item.title.id)}>
                      Open title
                    </button>
                    <button
                      className={item.favorite ? "collection-icon-action active" : "collection-icon-action"}
                      type="button"
                      disabled={busy}
                      aria-pressed={Boolean(item.favorite)}
                      aria-label={item.favorite ? `Remove ${item.title.name} from favorites` : `Add ${item.title.name} to favorites`}
                      onClick={() => updateItem(item, item.status, !item.favorite)}
                    >
                      <HeartIcon size={17} filled={Boolean(item.favorite)} />
                    </button>
                    <button className="collection-remove-action" type="button" disabled={busy} onClick={() => removeItem(item)}>
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

export function CollectionLoadingState() {
  return (
    <div className="collection-grid collection-loading" role="status" aria-label="Loading collection">
      {Array.from({ length: 5 }, (_, index) => <span key={index} />)}
    </div>
  );
}

function getWatchErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return "Could not update your collection right now.";
}

function getReleaseYear(releaseDate: string | null) {
  return releaseDate?.slice(0, 4) || "Date TBA";
}

function formatTitleType(type: string) {
  return type === "SERIES" ? "Series" : "Movie";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}
