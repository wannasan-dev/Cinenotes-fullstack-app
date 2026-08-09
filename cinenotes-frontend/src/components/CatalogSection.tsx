import { useEffect, useRef, useState } from "react";
import type { Title, TitleType } from "../types/title";
import { TitleCard } from "./TitleCard";

export type SortOption = "LATEST" | "YEAR" | "RATING";

export type CatalogFilters = {
  type: "ALL" | TitleType;
  genre: string;
  mood: string;
  sort: SortOption;
};

type CatalogSectionProps = {
  titles: Title[];
  genres: string[];
  moods: string[];
  searchText: string;
  filters: CatalogFilters;
  initialLoading: boolean;
  updating: boolean;
  error: string;
  lastAppliedFilter: keyof CatalogFilters | "search" | null;
  onSearchTextChange: (value: string) => void;
  onFiltersChange: (filters: CatalogFilters) => void;
  onClearSearch: () => void;
  onClearAll: () => void;
  onRemoveMostRecentFilter: () => void;
  onRetry: () => void;
  onOpenTitle: (title: Title) => void;
};

export function CatalogSection({
  titles,
  genres,
  moods,
  searchText,
  filters,
  initialLoading,
  updating,
  error,
  lastAppliedFilter,
  onSearchTextChange,
  onFiltersChange,
  onClearSearch,
  onClearAll,
  onRemoveMostRecentFilter,
  onRetry,
  onOpenTitle,
}: CatalogSectionProps) {
  const activeFilters = getActiveFilters(searchText, filters);
  const resultLabel = `${titles.length} ${titles.length === 1 ? "title" : "titles"}`;
  const liveMessage = initialLoading
    ? "Loading titles."
    : updating
      ? "Updating titles."
      : error
        ? "We couldn’t load titles."
        : `Results updated. ${titles.length} ${titles.length === 1 ? "title" : "titles"} found.`;

  return (
    <section
      id="catalog"
      className="page-section catalog-section"
      aria-labelledby="catalog-heading"
      tabIndex={-1}
    >
      <div className="section-heading">
        <p className="eyebrow">Discover</p>
        <h2 id="catalog-heading">Explore movies and series</h2>
      </div>

      <CatalogControls
        genres={genres}
        moods={moods}
        searchText={searchText}
        filters={filters}
        resultLabel={resultLabel}
        hasActiveFilters={activeFilters.length > 0}
        onSearchTextChange={onSearchTextChange}
        onClearSearch={onClearSearch}
        onFiltersChange={onFiltersChange}
        onClearAll={onClearAll}
      />

      {activeFilters.length > 0 && (
        <ActiveFilterTokens
          searchText={searchText}
          filters={filters}
          onSearchTextChange={onSearchTextChange}
          onFiltersChange={onFiltersChange}
          onClearAll={onClearAll}
        />
      )}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </p>

      {initialLoading ? (
        <div className="title-grid skeleton-grid" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="title-card-skeleton" key={index} />
          ))}
        </div>
      ) : error ? (
        <CatalogStatus
          type="error"
          title="We couldn’t load titles."
          message="Check your connection and try again."
          primaryLabel="Try again"
          onPrimaryAction={onRetry}
        />
      ) : titles.length === 0 ? (
        <CatalogStatus
          type="empty"
          title="No titles match these filters."
          message={getEmptyMessage(searchText, filters)}
          primaryLabel={lastAppliedFilter ? "Remove last filter" : undefined}
          onPrimaryAction={lastAppliedFilter ? onRemoveMostRecentFilter : undefined}
          secondaryLabel="Clear all filters"
          onSecondaryAction={onClearAll}
        />
      ) : (
        <div className={updating ? "catalog-results updating" : "catalog-results"} aria-busy={updating}>
          <div className="title-grid">
            {titles.map((title) => (
              <TitleCard key={title.id} title={title} onOpenTitle={onOpenTitle} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

type CatalogControlsProps = {
  genres: string[];
  moods: string[];
  searchText: string;
  filters: CatalogFilters;
  resultLabel: string;
  hasActiveFilters: boolean;
  onSearchTextChange: (value: string) => void;
  onClearSearch: () => void;
  onFiltersChange: (filters: CatalogFilters) => void;
  onClearAll: () => void;
};

export function CatalogControls({
  genres,
  moods,
  searchText,
  filters,
  resultLabel,
  hasActiveFilters,
  onSearchTextChange,
  onClearSearch,
  onFiltersChange,
  onClearAll,
}: CatalogControlsProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  function updateFilter<Key extends keyof CatalogFilters>(key: Key, value: CatalogFilters[Key]) {
    onFiltersChange({ ...filters, [key]: value });
  }

  function closeDrawer() {
    setDrawerOpen(false);
    window.setTimeout(() => filterButtonRef.current?.focus(), 0);
  }

  return (
    <div className="catalog-controls">
      <div className="search-control">
        <label htmlFor="catalog-search">Search titles</label>
        <div className="search-input-wrap">
          <input
            id="catalog-search"
            type="search"
            placeholder="Search movies and series"
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
          />
          {searchText && (
            <button type="button" onClick={onClearSearch} aria-label="Clear title search">
              ×
            </button>
          )}
        </div>
      </div>

      <div className="desktop-filter-row">
        <label>
          Type
          <select value={filters.type} onChange={(event) => updateFilter("type", event.target.value as CatalogFilters["type"])}>
            <option value="ALL">All titles</option>
            <option value="MOVIE">Movies</option>
            <option value="SERIES">Series</option>
          </select>
        </label>

        <label>
          Genre
          <select value={filters.genre} onChange={(event) => updateFilter("genre", event.target.value)}>
            <option value="ALL">All genres</option>
            {genres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
          </select>
        </label>

        <label>
          Mood
          <select value={filters.mood} onChange={(event) => updateFilter("mood", event.target.value)}>
            <option value="ALL">All moods</option>
            {moods.map((mood) => <option key={mood} value={mood}>{mood}</option>)}
          </select>
        </label>

        <span className="filter-separator" aria-hidden="true" />

        <label>
          Sort by
          <select value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value as SortOption)}>
            <option value="LATEST">Latest added</option>
            <option value="YEAR">Newest released</option>
            <option value="RATING">Highest TMDb rated</option>
          </select>
        </label>

        <p className="result-count">{resultLabel}</p>
        {hasActiveFilters && (
          <button className="text-button clear-all-button" type="button" onClick={onClearAll}>
            Clear all
          </button>
        )}
      </div>

      <div className="mobile-filter-summary">
        <button ref={filterButtonRef} className="secondary-button" type="button" onClick={() => setDrawerOpen(true)}>
          Filters{hasActiveFilters ? " · Active" : ""}
        </button>
        <p className="result-count">{resultLabel}</p>
      </div>

      {drawerOpen && (
        <MobileFilterDrawer
          genres={genres}
          moods={moods}
          filters={filters}
          onApply={(nextFilters) => {
            onFiltersChange(nextFilters);
            closeDrawer();
          }}
          onClear={() => {
            onClearAll();
            closeDrawer();
          }}
          onClose={closeDrawer}
        />
      )}
    </div>
  );
}

type ActiveFilterTokensProps = {
  searchText: string;
  filters: CatalogFilters;
  onSearchTextChange: (value: string) => void;
  onFiltersChange: (filters: CatalogFilters) => void;
  onClearAll: () => void;
};

export function ActiveFilterTokens({
  searchText,
  filters,
  onSearchTextChange,
  onFiltersChange,
  onClearAll,
}: ActiveFilterTokensProps) {
  return (
    <div className="active-filter-row" aria-label="Active filters">
      {searchText.trim() && (
        <button type="button" onClick={() => onSearchTextChange("")} aria-label={`Remove search filter ${searchText.trim()}`}>
          Search: “{searchText.trim()}” <span aria-hidden="true">×</span>
        </button>
      )}
      {filters.type !== "ALL" && (
        <button type="button" onClick={() => onFiltersChange({ ...filters, type: "ALL" })} aria-label={`Remove type filter ${filters.type === "MOVIE" ? "Movies" : "Series"}`}>
          Type: {filters.type === "MOVIE" ? "Movies" : "Series"} <span aria-hidden="true">×</span>
        </button>
      )}
      {filters.genre !== "ALL" && (
        <button type="button" onClick={() => onFiltersChange({ ...filters, genre: "ALL" })} aria-label={`Remove genre filter ${filters.genre}`}>
          Genre: {filters.genre} <span aria-hidden="true">×</span>
        </button>
      )}
      {filters.mood !== "ALL" && (
        <button type="button" onClick={() => onFiltersChange({ ...filters, mood: "ALL" })} aria-label={`Remove mood filter ${filters.mood}`}>
          Mood: {filters.mood} <span aria-hidden="true">×</span>
        </button>
      )}
      <button className="clear-token" type="button" onClick={onClearAll}>Clear all</button>
    </div>
  );
}

type MobileFilterDrawerProps = {
  genres: string[];
  moods: string[];
  filters: CatalogFilters;
  onApply: (filters: CatalogFilters) => void;
  onClear: () => void;
  onClose: () => void;
};

export function MobileFilterDrawer({ genres, moods, filters, onApply, onClear, onClose }: MobileFilterDrawerProps) {
  const [draft, setDraft] = useState(filters);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'));
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

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function updateDraft<Key extends keyof CatalogFilters>(key: Key, value: CatalogFilters[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="drawer-backdrop" role="presentation">
      <div ref={drawerRef} className="filter-drawer" role="dialog" aria-modal="true" aria-labelledby="filter-drawer-title">
        <div className="drawer-heading">
          <h2 id="filter-drawer-title">Filters</h2>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close filters">×</button>
        </div>

        <label>
          Type
          <select value={draft.type} onChange={(event) => updateDraft("type", event.target.value as CatalogFilters["type"])}>
            <option value="ALL">All titles</option>
            <option value="MOVIE">Movies</option>
            <option value="SERIES">Series</option>
          </select>
        </label>
        <label>
          Genre
          <select value={draft.genre} onChange={(event) => updateDraft("genre", event.target.value)}>
            <option value="ALL">All genres</option>
            {genres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
          </select>
        </label>
        <label>
          Mood
          <select value={draft.mood} onChange={(event) => updateDraft("mood", event.target.value)}>
            <option value="ALL">All moods</option>
            {moods.map((mood) => <option key={mood} value={mood}>{mood}</option>)}
          </select>
        </label>
        <div className="drawer-sort-group">
          <label>
            Sort by
            <select value={draft.sort} onChange={(event) => updateDraft("sort", event.target.value as SortOption)}>
              <option value="LATEST">Latest added</option>
              <option value="YEAR">Newest released</option>
              <option value="RATING">Highest TMDb rated</option>
            </select>
          </label>
        </div>
        <div className="drawer-actions">
          <button className="text-button" type="button" onClick={onClear}>Clear all</button>
          <button className="primary-button" type="button" onClick={() => onApply(draft)}>Apply filters</button>
        </div>
      </div>
    </div>
  );
}

type CatalogStatusProps = {
  type: "error" | "empty";
  title: string;
  message: string;
  primaryLabel?: string;
  onPrimaryAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
};

export function CatalogStatus({
  type,
  title,
  message,
  primaryLabel,
  onPrimaryAction,
  secondaryLabel,
  onSecondaryAction,
}: CatalogStatusProps) {
  return (
    <div className={`inline-status ${type === "error" ? "error-panel" : ""}`} role={type === "error" ? "alert" : "status"}>
      <h3>{title}</h3>
      <p>{message}</p>
      <div className="status-actions">
        {primaryLabel && onPrimaryAction && <button className="secondary-button" type="button" onClick={onPrimaryAction}>{primaryLabel}</button>}
        {secondaryLabel && onSecondaryAction && <button className="text-button" type="button" onClick={onSecondaryAction}>{secondaryLabel}</button>}
      </div>
    </div>
  );
}

function getActiveFilters(searchText: string, filters: CatalogFilters) {
  return [
    searchText.trim() ? `Search: ${searchText.trim()}` : "",
    filters.type !== "ALL" ? filters.type : "",
    filters.genre !== "ALL" ? filters.genre : "",
    filters.mood !== "ALL" ? filters.mood : "",
  ].filter(Boolean);
}

function getEmptyMessage(searchText: string, filters: CatalogFilters) {
  const active = [
    searchText.trim() ? `“${searchText.trim()}”` : "",
    filters.type === "MOVIE" ? "“Movies”" : filters.type === "SERIES" ? "“Series”" : "",
    filters.genre !== "ALL" ? `“${filters.genre}”` : "",
    filters.mood !== "ALL" ? `“${filters.mood}”` : "",
  ].filter(Boolean);

  if (active.length === 0) return "Try removing a filter or clearing all filters.";
  return `No titles match ${active.join(", ")}. Try removing a filter or clearing all filters.`;
}
