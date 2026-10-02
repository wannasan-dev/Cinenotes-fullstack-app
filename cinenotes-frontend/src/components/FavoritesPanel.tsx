import { useEffect, useState } from "react";
import { ApiError } from "../api/apiClient";
import {
  fetchCurrentUserWatchlist,
  upsertWatchlistItem,
} from "../api/watchlistApi";
import type { WatchlistItemResponse } from "../types/watchlist";
import { getPosterSrc } from "../utils/poster";
import { HeartIcon } from "./UiIcons";
import { CollectionLoadingState } from "./WatchlistPanel";

type FavoritesPanelProps = {
  authToken: string;
  refreshKey: number;
  onChanged: () => void;
  onBrowseTitles: () => void;
  onOpenTitle: (titleId: number) => Promise<void>;
};

export function FavoritesPanel({
  authToken,
  refreshKey,
  onChanged,
  onBrowseTitles,
  onOpenTitle,
}: FavoritesPanelProps) {
  const [favorites, setFavorites] = useState<WatchlistItemResponse[]>([]);
  const [busyItemId, setBusyItemId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFavorites() {
      try {
        setLoading(true);
        setError("");
        const items = await fetchCurrentUserWatchlist(authToken);
        setFavorites(items.filter((item) => Boolean(item.favorite)));
      } catch (loadError) {
        setError(getWatchErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [authToken, refreshKey]);

  async function removeFavorite(item: WatchlistItemResponse) {
    if (busyItemId !== null) return;

    try {
      setBusyItemId(item.id);
      setError("");
      await upsertWatchlistItem(
        { titleId: item.title.id, status: item.status, favorite: false },
        authToken
      );
      setFavorites((currentFavorites) => currentFavorites.filter((favorite) => favorite.id !== item.id));
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
    <section className="collection-page favorites-page" aria-labelledby="favorites-heading">
      <header className="collection-page-header favorites-page-header">
        <div>
          <p className="favorites-page-mark"><HeartIcon size={18} filled /></p>
          <h1 id="favorites-heading">My Favorites</h1>
          <p>The movies and series that mean the most to you.</p>
        </div>
      </header>

      {error && <p className="form-error collection-error" role="alert">{error}</p>}
      {loading && <CollectionLoadingState />}

      {!loading && favorites.length === 0 ? (
        <div className="collection-empty-state favorites-empty-state">
          <h2>No favorites yet.</h2>
          <p>Mark titles you love and they&apos;ll live here.</p>
          <button type="button" onClick={onBrowseTitles}>Browse titles</button>
        </div>
      ) : !loading ? (
        <div className="collection-grid favorites-collection-grid">
          {favorites.map((item) => (
            <article className="collection-card favorite-collection-card" key={item.id}>
              <button className="collection-poster-button" type="button" onClick={() => openTitle(item.title.id)} aria-label={`Open ${item.title.name}`}>
                <img src={getPosterSrc(item.title.posterPath)} alt={`${item.title.name} poster`} />
                <span className="favorite-poster-mark" aria-hidden="true"><HeartIcon size={17} filled /></span>
              </button>

              <div className="collection-card-content">
                <h2>{item.title.name}</h2>
                <p className="collection-title-meta">
                  <span>{item.title.releaseDate?.slice(0, 4) || "Date TBA"}</span>
                  <span>{item.title.type === "SERIES" ? "Series" : "Movie"}</span>
                </p>
                <div className="collection-card-actions favorite-card-actions">
                  <button className="collection-open-action" type="button" onClick={() => openTitle(item.title.id)}>Open title</button>
                  <button
                    className="collection-remove-action"
                    type="button"
                    disabled={busyItemId === item.id}
                    onClick={() => removeFavorite(item)}
                  >
                    Remove favorite
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function getWatchErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return "Could not update your favorites right now.";
}
