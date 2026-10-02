import { useEffect, useMemo, useState } from "react";
import { fetchCurrentUserReviews } from "../api/reviewApi";
import { fetchCurrentUserWatchLogs } from "../api/watchLogApi";
import { fetchCurrentUserWatchlist } from "../api/watchlistApi";
import type { ReviewResponse } from "../types/review";
import type { Title, TitleSummary } from "../types/title";
import type { WatchLogResponse } from "../types/watchLog";
import type { WatchlistItemResponse } from "../types/watchlist";
import { getPosterSrc } from "../utils/poster";

type AuthenticatedDiscoverSectionsProps = {
  titles: Title[];
  moods: string[];
  authToken: string;
  watchRefreshKey: number;
  onViewAll: (mood: string) => void;
  onOpenTitle: (title: Title) => void;
  onOpenWatchlistTitle: (titleId: number) => Promise<void>;
};

type ShelfTitle = Title | TitleSummary;

export function AuthenticatedDiscoverSections({
  titles,
  moods,
  authToken,
  watchRefreshKey,
  onViewAll,
  onOpenTitle,
  onOpenWatchlistTitle,
}: AuthenticatedDiscoverSectionsProps) {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItemResponse[]>([]);
  const [watchLogs, setWatchLogs] = useState<WatchLogResponse[]>([]);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [selectedFeeling, setSelectedFeeling] = useState("ALL");
  const [openError, setOpenError] = useState("");

  useEffect(() => {
    let ignore = false;

    Promise.allSettled([
      fetchCurrentUserWatchlist(authToken),
      fetchCurrentUserWatchLogs(authToken),
      fetchCurrentUserReviews(authToken),
    ]).then(([watchlistResult, watchLogResult, reviewResult]) => {
      if (!ignore) {
        setWatchlistItems(watchlistResult.status === "fulfilled" ? watchlistResult.value : []);
        setWatchLogs(watchLogResult.status === "fulfilled" ? watchLogResult.value : []);
        setReviews(reviewResult.status === "fulfilled" ? reviewResult.value : []);
      }
    });

    return () => {
      ignore = true;
    };
  }, [authToken, watchRefreshKey]);

  const watching = useMemo(
    () => watchlistItems.filter((item) =>
      item.status === "WATCHING" && item.title.type === "SERIES"
    ),
    [watchlistItems]
  );

  const browseMoods = useMemo(() => {
    const counts = new Map<string, number>();
    titles.forEach((title) => {
      title.moodTags.forEach((mood) => counts.set(mood.name, (counts.get(mood.name) ?? 0) + 1));
    });

    return [...moods]
      .sort((left, right) => (counts.get(right) ?? 0) - (counts.get(left) ?? 0) || left.localeCompare(right))
      .slice(0, 8);
  }, [moods, titles]);

  const moodTitles = useMemo(
    () => selectedFeeling === "ALL"
      ? []
      : titles.filter((title) => title.moodTags.some((mood) => mood.name === selectedFeeling)).slice(0, 8),
    [selectedFeeling, titles]
  );

  const recommendationResult = useMemo(
    () => getRecommendations(titles, watchlistItems, watchLogs, reviews),
    [reviews, titles, watchLogs, watchlistItems]
  );

  async function openWatchingTitle(titleId: number) {
    try {
      setOpenError("");
      await onOpenWatchlistTitle(titleId);
    } catch {
      setOpenError("We couldn’t open that title. Please try again.");
    }
  }

  return (
    <div className="authenticated-discovery-sections">
      {watching.length > 0 && (
        <section className="authenticated-discovery-section" aria-labelledby="continue-watching-heading">
          <DiscoveryHeading
            id="continue-watching-heading"
            title="Continue Watching"
            description="Series currently marked as watching in your Watchlist."
          />
          <TitleShelf
            label="Continue Watching titles"
            titles={watching.slice(0, 6).map((item) => item.title)}
            context={() => "Watching"}
            onOpen={(title) => void openWatchingTitle(title.id)}
          />
          {openError && <p className="discovery-inline-message" role="alert">{openError}</p>}
        </section>
      )}

      {recommendationResult.items.length > 0 && (
        <section className="authenticated-discovery-section" aria-labelledby="for-you-heading">
          <DiscoveryHeading
            id="for-you-heading"
            title="For You"
            description="Based on what you’ve enjoyed and logged in CineNotes."
          />
          <TitleShelf
            label="Titles recommended from your CineNotes history"
            titles={recommendationResult.items.map((item) => item.title)}
            context={(title) => recommendationResult.items.find((item) => item.title.id === title.id)?.reason ?? ""}
            onOpen={(title) => onOpenTitle(title as Title)}
          />
        </section>
      )}

      <section className="authenticated-discovery-section" aria-labelledby="feeling-heading">
        <DiscoveryHeading
          id="feeling-heading"
          title="Browse by Feeling"
          description="Explore movies and series through the feelings connected to them."
        />
        <div className="feeling-options" aria-label="Browse titles by feeling">
          {browseMoods.map((mood) => (
            <button
              key={mood}
              type="button"
              className={selectedFeeling === mood ? "selected" : ""}
              aria-pressed={selectedFeeling === mood}
              onClick={() => setSelectedFeeling(selectedFeeling === mood ? "ALL" : mood)}
            >
              {mood}
            </button>
          ))}
        </div>
        {selectedFeeling !== "ALL" && moodTitles.length > 0 && (
          <div className="feeling-results">
            <div className="feeling-results-heading">
              <h3>Titles connected with {selectedFeeling}</h3>
              <button className="text-button" type="button" onClick={() => onViewAll(selectedFeeling)}>
                View all {selectedFeeling} titles
              </button>
            </div>
            <TitleShelf
              label={`${selectedFeeling} titles`}
              titles={moodTitles}
              context={(title) => "moodTags" in title
                ? title.moodTags.slice(0, 2).map((mood) => mood.name).join(" · ")
                : ""}
              onOpen={(title) => onOpenTitle(title as Title)}
            />
          </div>
        )}
      </section>
    </div>
  );
}

type DiscoveryHeadingProps = {
  id: string;
  title: string;
  description: string;
};

function DiscoveryHeading({ id, title, description }: DiscoveryHeadingProps) {
  return (
    <header className="authenticated-discovery-heading">
      <div>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  );
}

type TitleShelfProps = {
  label: string;
  titles: ShelfTitle[];
  context?: (title: ShelfTitle) => string;
  onOpen: (title: ShelfTitle) => void;
};

function TitleShelf({ label, titles, context, onOpen }: TitleShelfProps) {
  return (
    <ul className="authenticated-title-shelf" aria-label={label}>
      {titles.map((title) => (
        <li key={title.id}>
          <button
            className="authenticated-shelf-card"
            type="button"
            onClick={() => onOpen(title)}
            aria-label={`Open ${title.name}`}
          >
            <span className="authenticated-shelf-poster">
              <img src={getPosterSrc(title.posterPath)} alt="" />
            </span>
            <span className="authenticated-shelf-copy">
              <strong>{title.name}</strong>
              <span>{getTitleMeta(title)}</span>
              {context?.(title) && <small>{context(title)}</small>}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function getTitleMeta(title: ShelfTitle) {
  const year = title.releaseDate?.slice(0, 4);
  const type = title.type === "MOVIE" ? "Movie" : "Series";
  return year ? `${year} · ${type}` : type;
}

type RecommendationItem = {
  title: Title;
  score: number;
  reason: string;
};

type RecommendationResult = {
  items: RecommendationItem[];
  signalScore: number;
};

function getRecommendations(
  titles: Title[],
  watchlistItems: WatchlistItemResponse[],
  watchLogs: WatchLogResponse[],
  reviews: ReviewResponse[]
): RecommendationResult {
  const titleById = new Map(titles.map((title) => [title.id, title]));
  const favoriteTitles = watchlistItems
    .filter((item) => item.favorite === true)
    .map((item) => titleById.get(item.title.id))
    .filter((title): title is Title => Boolean(title));
  const positiveReviewTitles = reviews
    .filter((review) => review.rating >= 7)
    .map((review) => titleById.get(review.titleId))
    .filter((title): title is Title => Boolean(title));
  const watchedTitleIds = new Set([
    ...watchLogs.map((log) => log.title.id),
    ...watchlistItems
      .filter((item) => item.status === "WATCHED")
      .map((item) => item.title.id),
  ]);
  const watchedTitles = [...watchedTitleIds]
    .map((titleId) => titleById.get(titleId))
    .filter((title): title is Title => Boolean(title));
  const positiveSourceTitles = uniqueTitles([...favoriteTitles, ...positiveReviewTitles]);

  const positiveGenreCounts = countNames(
    positiveSourceTitles.flatMap((title) => title.genres.map((genre) => genre.name))
  );
  const watchedGenreCounts = countNames(
    watchedTitles.flatMap((title) => title.genres.map((genre) => genre.name))
  );
  const moodCounts = countNames(
    watchLogs.flatMap((log) => log.moods.map((mood) => mood.name))
  );

  const interactionTitles = uniqueTitles([
    ...watchlistItems
      .map((item) => titleById.get(item.title.id))
      .filter((title): title is Title => Boolean(title)),
    ...watchLogs
      .map((log) => titleById.get(log.title.id))
      .filter((title): title is Title => Boolean(title)),
    ...reviews
      .map((review) => titleById.get(review.titleId))
      .filter((title): title is Title => Boolean(title)),
  ]);
  const typeCounts = new Map<Title["type"], number>();
  interactionTitles.forEach((title) => {
    typeCounts.set(title.type, (typeCounts.get(title.type) ?? 0) + 1);
  });
  const highestTypeCount = Math.max(0, ...typeCounts.values());
  const preferredTypes = new Set(
    [...typeCounts.entries()]
      .filter(([, count]) => count === highestTypeCount)
      .map(([type]) => type)
  );

  // Strong interactions count for three points; a logged memory with a mood
  // combines a light history signal with a medium mood signal.
  const signalScore =
    favoriteTitles.length * 3 +
    positiveReviewTitles.length * 3 +
    watchLogs.length +
    watchLogs.filter((log) => log.moods.length > 0).length * 2;

  if (signalScore < 4) return { items: [], signalScore };

  const excludedTitleIds = new Set([
    ...watchedTitleIds,
    ...favoriteTitles.map((title) => title.id),
    ...positiveReviewTitles.map((title) => title.id),
    ...watchlistItems
      .filter((item) => item.status === "WATCHING" || item.status === "DROPPED")
      .map((item) => item.title.id),
  ]);

  const items = titles
    .filter((title) => !excludedTitleIds.has(title.id))
    .map((title) => scoreCandidate(
      title,
      moodCounts,
      positiveGenreCounts,
      watchedGenreCounts,
      preferredTypes
    ))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) =>
      right.score - left.score ||
      (right.title.tmdbVoteAverage ?? 0) - (left.title.tmdbVoteAverage ?? 0) ||
      left.title.name.localeCompare(right.title.name)
    )
    .slice(0, 8);

  return { items, signalScore };
}

function scoreCandidate(
  title: Title,
  moodCounts: Map<string, number>,
  positiveGenreCounts: Map<string, number>,
  watchedGenreCounts: Map<string, number>,
  preferredTypes: Set<Title["type"]>
): RecommendationItem {
  const matchingMoods = title.moodTags
    .filter((mood) => moodCounts.has(mood.name))
    .sort((left, right) =>
      (moodCounts.get(right.name) ?? 0) - (moodCounts.get(left.name) ?? 0)
    );
  const matchingPositiveGenres = title.genres
    .filter((genre) => positiveGenreCounts.has(genre.name))
    .sort((left, right) =>
      (positiveGenreCounts.get(right.name) ?? 0) - (positiveGenreCounts.get(left.name) ?? 0)
    );

  const moodScore = matchingMoods.reduce(
    (total, mood) => total + 4 * Math.min(moodCounts.get(mood.name) ?? 0, 2),
    0
  );
  const positiveGenreScore = matchingPositiveGenres.reduce((total, genre) => {
    const count = positiveGenreCounts.get(genre.name) ?? 0;
    return total + 3 + (count >= 2 ? 2 : 0);
  }, 0);
  const watchedGenreScore = title.genres.reduce(
    (total, genre) => total + Math.min(watchedGenreCounts.get(genre.name) ?? 0, 2),
    0
  );
  const typeScore = preferredTypes.has(title.type) ? 1 : 0;

  return {
    title,
    score: moodScore + positiveGenreScore + watchedGenreScore + typeScore,
    reason: matchingMoods[0]
      ? `Matches your ${matchingMoods[0].name} mood`
      : matchingPositiveGenres[0]
        ? `Because you enjoy ${matchingPositiveGenres[0].name}`
        : `Matches your viewing history`,
  };
}

function countNames(names: string[]) {
  const counts = new Map<string, number>();
  names.forEach((name) => counts.set(name, (counts.get(name) ?? 0) + 1));
  return counts;
}

function uniqueTitles(titles: Title[]) {
  return [...new Map(titles.map((title) => [title.id, title])).values()];
}
