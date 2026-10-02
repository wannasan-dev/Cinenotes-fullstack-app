import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Title, TitleType } from "../types/title";
import { TitleCard } from "./TitleCard";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  FilterIcon,
  SearchIcon,
} from "./UiIcons";

export const CATALOG_PAGE_SIZE = 10;

export type SortOption =
  | "LATEST"
  | "YEAR"
  | "RATING"
  | "CINENOTES_RATING"
  | "TITLE";

export type CatalogFilters = {
  type: "ALL" | TitleType;
  genre: string;
  country: string;
  releaseYear: string;
  mood: string;
  sort: SortOption;
};

type CatalogSectionProps = {
  titles: Title[];
  totalResults: number;
  currentPage: number;
  pageSize: number;
  genres: string[];
  moods: string[];
  countries: string[];
  releaseYears: string[];
  searchText: string;
  filters: CatalogFilters;
  initialLoading: boolean;
  updating: boolean;
  error: string;
  lastAppliedFilter: keyof CatalogFilters | "search" | null;
  onSearchTextChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: CatalogFilters) => void;
  onClearSearch: () => void;
  onClearAll: () => void;
  onRemoveMostRecentFilter: () => void;
  onRetry: () => void;
  onOpenTitle: (title: Title) => void;
  authenticated?: boolean;
  showHeading?: boolean;
  discoveryContent?: ReactNode;
};

export function CatalogSection({
  titles,
  totalResults,
  currentPage,
  pageSize,
  genres,
  moods,
  countries,
  releaseYears,
  searchText,
  filters,
  initialLoading,
  updating,
  error,
  lastAppliedFilter,
  onSearchTextChange,
  onPageChange,
  onFiltersChange,
  onClearSearch,
  onClearAll,
  onRemoveMostRecentFilter,
  onRetry,
  onOpenTitle,
  authenticated = false,
  showHeading = true,
  discoveryContent,
}: CatalogSectionProps) {
  const activeFilters = getActiveFilters(searchText, filters, authenticated);
  const resultLabel = `${totalResults} ${totalResults === 1 ? "title" : "titles"}`;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const liveMessage = initialLoading
    ? "Loading titles."
    : updating
      ? "Updating titles."
      : error
        ? "We couldn’t load titles."
        : `Results updated. ${totalResults} ${totalResults === 1 ? "title" : "titles"} found. Page ${currentPage} of ${totalPages}.`;
  const controls = (
    <CatalogControls
      genres={genres}
      moods={moods}
      countries={countries}
      releaseYears={releaseYears}
      searchText={searchText}
      filters={filters}
      resultLabel={resultLabel}
      hasActiveFilters={activeFilters.length > 0}
      onSearchTextChange={onSearchTextChange}
      onClearSearch={onClearSearch}
      onFiltersChange={onFiltersChange}
      onClearAll={onClearAll}
      authenticated={authenticated}
    />
  );
  const activeTokens = activeFilters.length > 0 ? (
    <ActiveFilterTokens
      searchText={searchText}
      filters={filters}
      authenticated={authenticated}
      onSearchTextChange={onSearchTextChange}
      onFiltersChange={onFiltersChange}
      onClearAll={onClearAll}
    />
  ) : null;

  return (
    <section
      id="catalog"
      className={authenticated
        ? "page-section catalog-section authenticated-catalog-section"
        : "page-section catalog-section"}
      aria-labelledby="catalog-heading"
      tabIndex={-1}
    >
      {showHeading && (
        <div className="section-heading">
          <p className="eyebrow">Discover</p>
          <h2 id="catalog-heading" tabIndex={-1}>Explore movies and series</h2>
        </div>
      )}

      {authenticated ? (
        <>
          {discoveryContent}
          <header className="browse-all-heading">
            <h2 id="browse-all-heading" tabIndex={-1}>Browse All</h2>
            <p>Explore every movie and series in CineNotes.</p>
          </header>
          {controls}
          {activeTokens}
        </>
      ) : (
        <>
          {controls}
          {activeTokens}
        </>
      )}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </p>

      {initialLoading ? (
        <>
          {authenticated && <p className="catalog-state-label" aria-hidden="true">Loading titles.</p>}
          <div className="title-grid skeleton-grid" aria-hidden="true">
            {Array.from({ length: CATALOG_PAGE_SIZE }).map((_, index) => (
              <div className="title-card-skeleton" key={index} />
            ))}
          </div>
        </>
      ) : error ? (
        <CatalogStatus
          type="error"
          title="We couldn’t load titles."
          message="Check your connection and try again."
          primaryLabel="Try again"
          onPrimaryAction={onRetry}
        />
      ) : totalResults === 0 ? (
        <CatalogStatus
          type="empty"
          title="No titles match these filters."
          message={getEmptyMessage(searchText, filters)}
          primaryLabel={lastAppliedFilter
            ? authenticated ? "Remove most recent filter" : "Remove last filter"
            : undefined}
          onPrimaryAction={lastAppliedFilter ? onRemoveMostRecentFilter : undefined}
          secondaryLabel="Clear all filters"
          onSecondaryAction={onClearAll}
        />
      ) : (
        <div className={updating ? "catalog-results updating" : "catalog-results"} aria-busy={updating}>
          {authenticated && (
            <p className="catalog-update-status" aria-hidden="true">
              {updating ? "Updating titles." : ""}
            </p>
          )}
          <div className="title-grid">
            {titles.map((title) => (
              <TitleCard key={title.id} title={title} onOpenTitle={onOpenTitle} />
            ))}
          </div>
          {totalPages > 1 && (
            <CatalogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        </div>
      )}
    </section>
  );
}

type CatalogControlsProps = {
  genres: string[];
  moods: string[];
  countries: string[];
  releaseYears: string[];
  searchText: string;
  filters: CatalogFilters;
  resultLabel: string;
  hasActiveFilters: boolean;
  onSearchTextChange: (value: string) => void;
  onClearSearch: () => void;
  onFiltersChange: (filters: CatalogFilters) => void;
  onClearAll: () => void;
  authenticated: boolean;
};

export function CatalogControls({
  genres,
  moods,
  countries,
  releaseYears,
  searchText,
  filters,
  resultLabel,
  hasActiveFilters,
  onSearchTextChange,
  onClearSearch,
  onFiltersChange,
  onClearAll,
  authenticated,
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
          <span className="search-leading-icon"><SearchIcon size={19} /></span>
          <input
            id="catalog-search"
            type="search"
            placeholder="Search movies and series"
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
          />
          {searchText && (
            <button type="button" onClick={onClearSearch} aria-label="Clear title search">
              <CloseIcon size={18} />
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

        {authenticated ? (
          <>
            <label>
              Country
              <select value={filters.country} onChange={(event) => updateFilter("country", event.target.value)}>
                <option value="ALL">All countries</option>
                {countries.map((country) => <option key={country} value={country}>{country}</option>)}
              </select>
            </label>
            <label>
              Release year
              <select value={filters.releaseYear} onChange={(event) => updateFilter("releaseYear", event.target.value)}>
                <option value="ALL">All years</option>
                {releaseYears.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>
          </>
        ) : (
          <label>
            Mood
            <select value={filters.mood} onChange={(event) => updateFilter("mood", event.target.value)}>
              <option value="ALL">All moods</option>
              {moods.map((mood) => <option key={mood} value={mood}>{mood}</option>)}
            </select>
          </label>
        )}

        <span className="filter-separator" aria-hidden="true" />

        <label>
          Sort by
          <select value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value as SortOption)}>
            <SortOptions authenticated={authenticated} />
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
        <button ref={filterButtonRef} className="secondary-button mobile-filter-button" type="button" onClick={() => setDrawerOpen(true)}>
          <FilterIcon size={18} />
          Filters{hasActiveFilters ? " · Active" : ""}
        </button>
        <p className="result-count">{resultLabel}</p>
      </div>

      {drawerOpen && (
        <MobileFilterDrawer
          genres={genres}
          moods={moods}
          countries={countries}
          releaseYears={releaseYears}
          filters={filters}
          authenticated={authenticated}
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
  authenticated: boolean;
  onSearchTextChange: (value: string) => void;
  onFiltersChange: (filters: CatalogFilters) => void;
  onClearAll: () => void;
};

export function ActiveFilterTokens({
  searchText,
  filters,
  authenticated,
  onSearchTextChange,
  onFiltersChange,
  onClearAll,
}: ActiveFilterTokensProps) {
  return (
    <div className="active-filter-row" aria-label="Active filters">
      {searchText.trim() && (
        <button type="button" onClick={() => onSearchTextChange("")} aria-label={`Remove search filter ${searchText.trim()}`}>
          Search: “{searchText.trim()}” <CloseIcon size={14} />
        </button>
      )}
      {filters.type !== "ALL" && (
        <button type="button" onClick={() => onFiltersChange({ ...filters, type: "ALL" })} aria-label={`Remove type filter ${filters.type === "MOVIE" ? "Movies" : "Series"}`}>
          Type: {filters.type === "MOVIE" ? "Movies" : "Series"} <CloseIcon size={14} />
        </button>
      )}
      {filters.genre !== "ALL" && (
        <button type="button" onClick={() => onFiltersChange({ ...filters, genre: "ALL" })} aria-label={`Remove genre filter ${filters.genre}`}>
          Genre: {filters.genre} <CloseIcon size={14} />
        </button>
      )}
      {authenticated && filters.country !== "ALL" && (
        <button type="button" onClick={() => onFiltersChange({ ...filters, country: "ALL" })} aria-label={`Remove country filter ${filters.country}`}>
          Country: {filters.country} <CloseIcon size={14} />
        </button>
      )}
      {authenticated && filters.releaseYear !== "ALL" && (
        <button type="button" onClick={() => onFiltersChange({ ...filters, releaseYear: "ALL" })} aria-label={`Remove release year filter ${filters.releaseYear}`}>
          Year: {filters.releaseYear} <CloseIcon size={14} />
        </button>
      )}
      {filters.mood !== "ALL" && (
        <button type="button" onClick={() => onFiltersChange({ ...filters, mood: "ALL" })} aria-label={`Remove mood filter ${filters.mood}`}>
          Mood: {filters.mood} <CloseIcon size={14} />
        </button>
      )}
      <button className="clear-token" type="button" onClick={onClearAll}>Clear all</button>
    </div>
  );
}

type MobileFilterDrawerProps = {
  genres: string[];
  moods: string[];
  countries: string[];
  releaseYears: string[];
  filters: CatalogFilters;
  authenticated: boolean;
  onApply: (filters: CatalogFilters) => void;
  onClear: () => void;
  onClose: () => void;
};

export function MobileFilterDrawer({ genres, moods, countries, releaseYears, filters, authenticated, onApply, onClear, onClose }: MobileFilterDrawerProps) {
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
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close filters"><CloseIcon size={20} /></button>
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
        {authenticated ? (
          <>
            <label>
              Country
              <select value={draft.country} onChange={(event) => updateDraft("country", event.target.value)}>
                <option value="ALL">All countries</option>
                {countries.map((country) => <option key={country} value={country}>{country}</option>)}
              </select>
            </label>
            <label>
              Release year
              <select value={draft.releaseYear} onChange={(event) => updateDraft("releaseYear", event.target.value)}>
                <option value="ALL">All years</option>
                {releaseYears.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>
          </>
        ) : (
          <label>
            Mood
            <select value={draft.mood} onChange={(event) => updateDraft("mood", event.target.value)}>
              <option value="ALL">All moods</option>
              {moods.map((mood) => <option key={mood} value={mood}>{mood}</option>)}
            </select>
          </label>
        )}
        <div className="drawer-sort-group">
          <label>
            Sort by
            <select value={draft.sort} onChange={(event) => updateDraft("sort", event.target.value as SortOption)}>
              <SortOptions authenticated={authenticated} />
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

function SortOptions({ authenticated }: { authenticated: boolean }) {
  if (!authenticated) {
    return (
      <>
        <option value="LATEST">Latest added</option>
        <option value="YEAR">Newest released</option>
        <option value="RATING">Highest TMDb rated</option>
      </>
    );
  }

  return (
    <>
      <option value="YEAR">Newest released</option>
      <option value="CINENOTES_RATING">Highest CineNotes rating</option>
      <option value="RATING">Highest TMDb rated</option>
      <option value="TITLE">Title A–Z</option>
    </>
  );
}

type CatalogPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function CatalogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CatalogPaginationProps) {
  const items = getPaginationItems(currentPage, totalPages);

  return (
    <nav className="catalog-pagination" aria-label="Catalog pages">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Page {currentPage} of {totalPages}
      </p>
      <button
        className="pagination-direction"
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous catalog page"
      >
        <ChevronLeftIcon size={17} />
        <span>Previous</span>
      </button>

      <div className="pagination-pages">
        {items.map((item) =>
          typeof item === "number" ? (
            <button
              key={item}
              type="button"
              className={item === currentPage ? "current" : ""}
              aria-current={item === currentPage ? "page" : undefined}
              aria-label={`Go to catalog page ${item}`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="pagination-ellipsis" aria-hidden="true">…</span>
          )
        )}
      </div>

      <button
        className="pagination-direction"
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next catalog page"
      >
        <span>Next</span>
        <ChevronRightIcon size={17} />
      </button>
    </nav>
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

function getActiveFilters(searchText: string, filters: CatalogFilters, authenticated: boolean) {
  return [
    searchText.trim() ? `Search: ${searchText.trim()}` : "",
    filters.type !== "ALL" ? filters.type : "",
    filters.genre !== "ALL" ? filters.genre : "",
    authenticated && filters.country !== "ALL" ? filters.country : "",
    authenticated && filters.releaseYear !== "ALL" ? filters.releaseYear : "",
    filters.mood !== "ALL" ? filters.mood : "",
  ].filter(Boolean);
}

function getEmptyMessage(searchText: string, filters: CatalogFilters) {
  const active = [
    searchText.trim() ? `“${searchText.trim()}”` : "",
    filters.type === "MOVIE" ? "“Movies”" : filters.type === "SERIES" ? "“Series”" : "",
    filters.genre !== "ALL" ? `“${filters.genre}”` : "",
    filters.country !== "ALL" ? `“${filters.country}”` : "",
    filters.releaseYear !== "ALL" ? `“${filters.releaseYear}”` : "",
    filters.mood !== "ALL" ? `“${filters.mood}”` : "",
  ].filter(Boolean);

  if (active.length === 0) return "Try removing a filter or clearing all filters.";
  return `No titles match ${active.join(", ")}. Try removing a filter or clearing all filters.`;
}

function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const visiblePages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const pages = Array.from(visiblePages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
  const items: Array<number | "ellipsis-start" | "ellipsis-end"> = [];

  pages.forEach((page, index) => {
    const previousPage = pages[index - 1];
    if (previousPage && page - previousPage > 1) {
      items.push(previousPage === 1 ? "ellipsis-start" : "ellipsis-end");
    }
    items.push(page);
  });

  return items;
}
