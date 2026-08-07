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

type WatchlistPanelProps = {
  authToken: string;
  refreshKey: number;
  onChanged: () => void;
};

export function WatchlistPanel({
  authToken,
  refreshKey,
  onChanged,
}: WatchlistPanelProps) {
  const [items, setItems] = useState<WatchlistItemResponse[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | WatchStatus>("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWatchlist() {
      try {
        setLoading(true);
        setError("");
        setItems(await fetchCurrentUserWatchlist(authToken));
      } catch (error) {
        setError(getWatchErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadWatchlist();
  }, [authToken, refreshKey]);

  const filteredItems =
    selectedStatus === "ALL"
      ? items
      : items.filter((item) => item.status === selectedStatus);

  async function updateItem(
    item: WatchlistItemResponse,
    nextStatus: WatchStatus,
    favorite: boolean
  ) {
    try {
      setError("");
      const updatedItem = await upsertWatchlistItem(
        {
          titleId: item.title.id,
          status: nextStatus,
          favorite,
        },
        authToken
      );

      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === updatedItem.id ? updatedItem : currentItem
        )
      );
      onChanged();
    } catch (error) {
      setError(getWatchErrorMessage(error));
    }
  }

  async function removeItem(item: WatchlistItemResponse) {
    try {
      setError("");
      await removeWatchlistItemByTitle(item.title.id, authToken);
      setItems((currentItems) =>
        currentItems.filter((currentItem) => currentItem.id !== item.id)
      );
      onChanged();
    } catch (error) {
      setError(getWatchErrorMessage(error));
    }
  }

  return (
    <section className="watch-panel">
      <div className="watch-panel-header">
        <div>
          <p className="eyebrow">Watchlist</p>
          <h2>Your saved titles</h2>
        </div>

        <select
          value={selectedStatus}
          onChange={(event) =>
            setSelectedStatus(event.target.value as "ALL" | WatchStatus)
          }
        >
          <option value="ALL">All statuses</option>
          {WATCH_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getWatchStatusLabel(status)}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="watch-empty">Loading watchlist...</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && filteredItems.length === 0 ? (
        <p className="watch-empty">No watchlist items found.</p>
      ) : (
        <div className="watchlist-grid">
          {filteredItems.map((item) => (
            <article key={item.id} className="watchlist-item">
              <img src={getPosterSrc(item.title.posterPath)} alt={item.title.name} />
              <div>
                <h3>{item.title.name}</h3>
                <p>{item.title.type}</p>

                <label>
                  Status
                  <select
                    value={item.status}
                    onChange={(event) =>
                      updateItem(
                        item,
                        event.target.value as WatchStatus,
                        Boolean(item.favorite)
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
                    checked={Boolean(item.favorite)}
                    onChange={(event) =>
                      updateItem(item, item.status, event.target.checked)
                    }
                  />
                  Favorite
                </label>

                <button type="button" onClick={() => removeItem(item)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function getWatchErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Could not update watchlist right now.";
}
