import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import "./App.css";
import { fetchMoodTags } from "./api/moodTagApi";
import { fetchTitleById, fetchTitles } from "./api/titleApi";
import { clearStoredAuth, getStoredAuth, storeAuth, storeAuthUser } from "./auth/authStorage";
import { AdminDashboard } from "./components/AdminDashboard";
import { AuthenticatedDiscoverSections } from "./components/AuthenticatedDiscoverSections";
import { AuthDialog } from "./components/AuthDialog";
import {
  CATALOG_PAGE_SIZE,
  CatalogSection,
  type CatalogFilters,
} from "./components/CatalogSection";
import { GlobalHeader, type Workspace } from "./components/GlobalHeader";
import { FavoritesPanel } from "./components/FavoritesPanel";
import { HomeHero } from "./components/HomeHero";
import {
  FinalJournalCta,
  HowCineNotesWorks,
  SiteFooter,
} from "./components/HomeSections";
import { MoodDiscoverySection } from "./components/MoodDiscoverySection";
import { ProfilePanel } from "./components/ProfilePanel";
import { TitleDetailModal } from "./components/TitleDetailModal";
import { WatchHistoryPanel } from "./components/WatchHistoryPanel";
import { WatchlistPanel } from "./components/WatchlistPanel";
import type { AuthMode } from "./components/LoginForm";
import type { AuthResponse, AuthState } from "./types/auth";
import type { MoodTagResponse, Title } from "./types/title";
import type { TitleFocusIntent, TitleOpenOptions } from "./types/titleNavigation";
import { filterAndSortTitles } from "./utils/TitleUtils";

const DEFAULT_FILTERS: CatalogFilters = {
  type: "ALL",
  genre: "ALL",
  country: "ALL",
  releaseYear: "ALL",
  mood: "ALL",
  sort: "LATEST",
};

type MoodCatalogState = {
  token: string | null;
  moods: MoodTagResponse[];
  error: string;
};

function App() {
  const [baseTitles, setBaseTitles] = useState<Title[]>([]);
  const [catalogSourceTitles, setCatalogSourceTitles] = useState<Title[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [catalogUpdating, setCatalogUpdating] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [catalogReady, setCatalogReady] = useState(false);
  const [requestNonce, setRequestNonce] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [appliedSearchText, setAppliedSearchText] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastAppliedFilter, setLastAppliedFilter] =
    useState<keyof CatalogFilters | "search" | null>(null);
  const [discoveryMood, setDiscoveryMood] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const [titleFocusIntent, setTitleFocusIntent] = useState<TitleFocusIntent | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(null);
  const [watchRefreshKey, setWatchRefreshKey] = useState(0);
  const [authState, setAuthState] = useState<AuthState | null>(() => getStoredAuth());
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [moodCatalogState, setMoodCatalogState] = useState<MoodCatalogState>({
    token: null,
    moods: [],
    error: "",
  });

  const catalogRequestIdRef = useRef(0);
  const authReturnFocusRef = useRef<HTMLElement | null>(null);
  const workspaceRef = useRef<HTMLElement>(null);
  const titleFocusRequestIdRef = useRef(0);
  const moodCatalogToken = authState?.token ?? null;

  const loadBaseTitles = useCallback(async () => {
    try {
      setInitialLoading(true);
      setCatalogError("");
      const data = await fetchTitles();
      setBaseTitles(data);
      setCatalogSourceTitles(data);
      setCatalogReady(true);
    } catch {
      setCatalogError("Could not load titles.");
      setCatalogReady(false);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    fetchTitles()
      .then((data) => {
        if (ignore) return;
        setBaseTitles(data);
        setCatalogSourceTitles(data);
        setCatalogReady(true);
      })
      .catch(() => {
        if (ignore) return;
        setCatalogError("Could not load titles.");
        setCatalogReady(false);
      })
      .finally(() => {
        if (!ignore) setInitialLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!moodCatalogToken) return;
    let ignore = false;

    fetchMoodTags(moodCatalogToken)
      .then((moodCatalog) => {
        if (!ignore) {
          setMoodCatalogState({
            token: moodCatalogToken,
            moods: moodCatalog,
            error: "",
          });
        }
      })
      .catch(() => {
        if (!ignore) {
          setMoodCatalogState({
            token: moodCatalogToken,
            moods: [],
            error: "Feelings are temporarily unavailable.",
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, [moodCatalogToken]);

  const moodCatalogIsCurrent = Boolean(
    moodCatalogToken && moodCatalogState.token === moodCatalogToken
  );
  const watchMemoryMoods = moodCatalogIsCurrent ? moodCatalogState.moods : [];
  const watchMemoryMoodsLoading = Boolean(moodCatalogToken) && !moodCatalogIsCurrent;
  const watchMemoryMoodsError = moodCatalogIsCurrent ? moodCatalogState.error : "";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setAppliedSearchText(searchText.trim());
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchText]);

  const hasServerFilters =
    filters.type !== "ALL" || filters.genre !== "ALL" || appliedSearchText !== "";

  useEffect(() => {
    if (!catalogReady) return;
    if (!hasServerFilters) return;

    const requestId = ++catalogRequestIdRef.current;

    async function loadCatalogResults() {
      try {
        setCatalogUpdating(true);
        setCatalogError("");
        const data = await fetchTitles({
          type: filters.type === "ALL" ? undefined : filters.type,
          genre: filters.genre === "ALL" ? undefined : filters.genre,
          keyword: appliedSearchText || undefined,
        });

        if (requestId === catalogRequestIdRef.current) {
          setCatalogSourceTitles(data);
        }
      } catch {
        if (requestId === catalogRequestIdRef.current) {
          setCatalogError("Could not load titles.");
        }
      } finally {
        if (requestId === catalogRequestIdRef.current) {
          setCatalogUpdating(false);
        }
      }
    }

    loadCatalogResults();
  }, [appliedSearchText, catalogReady, filters.genre, filters.type, hasServerFilters, requestNonce]);

  const genres = useMemo(
    () =>
      Array.from(
        new Set(baseTitles.flatMap((title) => title.genres.map((genre) => genre.name)))
      ).sort((a, b) => a.localeCompare(b)),
    [baseTitles]
  );

  const moods = useMemo(
    () =>
      Array.from(
        new Set(baseTitles.flatMap((title) => title.moodTags.map((mood) => mood.name)))
      ).sort((a, b) => a.localeCompare(b)),
    [baseTitles]
  );

  const countries = useMemo(
    () => Array.from(new Set(baseTitles.map((title) => title.country).filter(Boolean) as string[]))
      .sort((left, right) => left.localeCompare(right)),
    [baseTitles]
  );

  const releaseYears = useMemo(
    () => Array.from(new Set(baseTitles
      .map((title) => title.releaseDate?.slice(0, 4))
      .filter(Boolean) as string[]))
      .sort((left, right) => right.localeCompare(left)),
    [baseTitles]
  );

  const authenticatedDiscoverIsOpen = Boolean(authState && activeWorkspace === null);
  const effectiveFilters = useMemo<CatalogFilters>(
    () => authenticatedDiscoverIsOpen && filters.sort === "LATEST"
      ? { ...filters, sort: "YEAR" }
      : filters,
    [authenticatedDiscoverIsOpen, filters]
  );

  const visibleTitles = useMemo(
    () =>
      filterAndSortTitles(hasServerFilters ? catalogSourceTitles : baseTitles, {
        selectedType: effectiveFilters.type,
        searchText: appliedSearchText,
        selectedGenre: effectiveFilters.genre,
        selectedMood: effectiveFilters.mood,
        selectedCountry: effectiveFilters.country,
        selectedReleaseYear: effectiveFilters.releaseYear,
        sortOption: effectiveFilters.sort,
      }),
    [appliedSearchText, baseTitles, catalogSourceTitles, effectiveFilters, hasServerFilters]
  );

  const totalPages = Math.max(1, Math.ceil(visibleTitles.length / CATALOG_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedTitles = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * CATALOG_PAGE_SIZE;
    return visibleTitles.slice(startIndex, startIndex + CATALOG_PAGE_SIZE);
  }, [safeCurrentPage, visibleTitles]);

  function openAuth(mode: AuthMode) {
    authReturnFocusRef.current = document.activeElement as HTMLElement | null;
    setAuthMode(mode);
    setAuthDialogOpen(true);
  }

  const closeAuth = useCallback(() => {
    setAuthDialogOpen(false);
    window.setTimeout(() => authReturnFocusRef.current?.focus(), 0);
  }, []);

  function handleAuthSuccess(response: AuthResponse) {
    const completedMode = authMode;
    setAuthState(storeAuth(response));
    setAuthDialogOpen(false);

    if (completedMode === "register") {
      setActiveWorkspace("journal");
      window.setTimeout(() => workspaceRef.current?.focus(), 0);
    } else {
      window.setTimeout(() => authReturnFocusRef.current?.focus(), 0);
    }
  }

  function handleLogout() {
    clearStoredAuth();
    setAuthState(null);
    setActiveWorkspace(null);
    setFilters(DEFAULT_FILTERS);
    setSearchText("");
    setAppliedSearchText("");
    setCurrentPage(1);
  }

  const handleProfileUpdated = useCallback((profile: AuthState["user"]) => {
    const nextAuthState = storeAuthUser(profile);
    if (nextAuthState) setAuthState(nextAuthState);
  }, []);

  const handleWatchDataChanged = useCallback(() => {
    setWatchRefreshKey((currentKey) => currentKey + 1);
  }, []);

  const createTitleFocusIntent = useCallback((options?: TitleOpenOptions) => {
    if (!options?.focusTarget) return null;

    titleFocusRequestIdRef.current += 1;
    return {
      requestId: titleFocusRequestIdRef.current,
      focusTarget: options.focusTarget,
      watchLogId: options.watchLogId,
    };
  }, []);

  const openTitle = useCallback((title: Title, options?: TitleOpenOptions) => {
    setTitleFocusIntent(createTitleFocusIntent(options));
    setSelectedTitle(title);
  }, [createTitleFocusIntent]);

  const openCollectionTitle = useCallback(async (titleId: number, options?: TitleOpenOptions) => {
    const focusIntent = createTitleFocusIntent(options);
    const title = await fetchTitleById(titleId);
    setTitleFocusIntent(focusIntent);
    setSelectedTitle(title);
  }, [createTitleFocusIntent]);

  const closeTitle = useCallback(() => {
    setSelectedTitle(null);
    setTitleFocusIntent(null);
  }, []);

  const consumeTitleFocusIntent = useCallback(() => {
    setTitleFocusIntent(null);
  }, []);

  function openWorkspace(workspace: Exclude<Workspace, null>) {
    setActiveWorkspace(workspace);
    window.setTimeout(() => {
      workspaceRef.current?.focus();
      workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function navigateToSection(sectionId: "catalog" | "how-it-works") {
    setActiveWorkspace(null);
    const targetId = authState && sectionId === "catalog"
      ? "catalog-heading"
      : sectionId;
    window.setTimeout(() => focusSection(targetId), 0);
  }

  function handleFiltersChange(nextFilters: CatalogFilters) {
    const changedKey = (Object.keys(nextFilters) as Array<keyof CatalogFilters>).find(
      (key) => nextFilters[key] !== filters[key]
    );
    if (changedKey && changedKey !== "sort") setLastAppliedFilter(changedKey);
    if (changedKey) setCurrentPage(1);
    if (
      nextFilters.type === "ALL" &&
      nextFilters.genre === "ALL" &&
      appliedSearchText === ""
    ) {
      catalogRequestIdRef.current += 1;
      setCatalogUpdating(false);
      setCatalogError("");
    }
    setFilters(nextFilters);
  }

  function handleSearchTextChange(value: string) {
    setSearchText(value);
    setCurrentPage(1);
    if (value.trim()) setLastAppliedFilter("search");
    if (!value.trim() && filters.type === "ALL" && filters.genre === "ALL") {
      catalogRequestIdRef.current += 1;
      setCatalogUpdating(false);
      setCatalogError("");
    }
  }

  function clearAllFilters() {
    catalogRequestIdRef.current += 1;
    setSearchText("");
    setAppliedSearchText("");
    setFilters((currentFilters) => ({
      ...DEFAULT_FILTERS,
      sort: currentFilters.sort,
    }));
    setLastAppliedFilter(null);
    setCurrentPage(1);
    setCatalogUpdating(false);
    setCatalogError("");
  }

  function removeMostRecentFilter() {
    setCurrentPage(1);
    if (lastAppliedFilter === "search") {
      catalogRequestIdRef.current += 1;
      setSearchText("");
      setAppliedSearchText("");
    } else if (lastAppliedFilter) {
      setFilters((current) => ({
        ...current,
        [lastAppliedFilter]: lastAppliedFilter === "sort" ? "LATEST" : "ALL",
      }));
    }
    setLastAppliedFilter(null);
  }

  function retryCatalog() {
    if (!catalogReady) {
      loadBaseTitles();
      return;
    }
    setRequestNonce((current) => current + 1);
  }

  function viewAllMoodMatches(mood: string) {
    setFilters((current) => ({ ...current, mood }));
    setLastAppliedFilter("mood");
    setCurrentPage(1);
    window.setTimeout(() => focusSection("catalog"), 0);
  }

  function changeCatalogPage(page: number) {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
    window.setTimeout(() => {
      const heading = document.getElementById(authenticatedDiscoverIsOpen
        ? "browse-all-heading"
        : "catalog-heading");
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    }, 0);
  }

  async function refreshTitles() {
    try {
      const data = await fetchTitles();
      setBaseTitles(data);
      setCatalogError("");
      setCatalogReady(true);
      setRequestNonce((current) => current + 1);
    } catch {
      setCatalogError("Could not refresh titles.");
    }
  }

  function renderWorkspace() {
    if (!authState || !activeWorkspace) return null;

    if (activeWorkspace === "admin" && authState.user.role === "ADMIN") {
      return (
        <AdminDashboard
          authToken={authState.token}
          titles={baseTitles}
          onTitleCreated={refreshTitles}
          onTitleUpdated={refreshTitles}
          onTitleDeleted={(titleId) => {
            setBaseTitles((current) => current.filter((title) => title.id !== titleId));
            setCatalogSourceTitles((current) => current.filter((title) => title.id !== titleId));
            if (selectedTitle?.id === titleId) setSelectedTitle(null);
            refreshTitles();
          }}
        />
      );
    }

    return null;
  }

  const authenticatedPageIsOpen = Boolean(
    authState && (
      activeWorkspace === "journal" ||
      activeWorkspace === "watchlist" ||
      activeWorkspace === "favorites" ||
      activeWorkspace === "profile"
    )
  );

  function renderCatalogSection(
    authenticated: boolean,
    showHeading = true,
    discoveryContent?: ReactNode
  ) {
    const displayedFilters = authenticated ? effectiveFilters : filters;
    return (
      <CatalogSection
        titles={paginatedTitles}
        totalResults={visibleTitles.length}
        currentPage={safeCurrentPage}
        pageSize={CATALOG_PAGE_SIZE}
        genres={genres}
        moods={moods}
        countries={countries}
        releaseYears={releaseYears}
        searchText={searchText}
        filters={displayedFilters}
        initialLoading={initialLoading}
        updating={catalogUpdating}
        error={catalogError}
        lastAppliedFilter={lastAppliedFilter}
        onSearchTextChange={handleSearchTextChange}
        onPageChange={changeCatalogPage}
        onFiltersChange={handleFiltersChange}
        onClearSearch={() => {
          catalogRequestIdRef.current += 1;
          setSearchText("");
          setAppliedSearchText("");
          setCurrentPage(1);
          setCatalogUpdating(false);
          if (filters.type === "ALL" && filters.genre === "ALL") setCatalogError("");
        }}
        onClearAll={clearAllFilters}
        onRemoveMostRecentFilter={removeMostRecentFilter}
        onRetry={retryCatalog}
        onOpenTitle={openTitle}
        authenticated={authenticated}
        showHeading={showHeading}
        discoveryContent={discoveryContent}
      />
    );
  }

  return (
    <div id="top" className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <GlobalHeader
        authState={authState}
        activeWorkspace={activeWorkspace}
        onOpenAuth={openAuth}
        onOpenWorkspace={openWorkspace}
        onLogout={handleLogout}
        onNavigateToSection={navigateToSection}
      />

      <main id="main-content" className="app">
        {authenticatedPageIsOpen && authState ? (
          <section
            ref={workspaceRef}
            className={
              activeWorkspace === "journal"
                ? "journal-page-shell"
                : activeWorkspace === "profile"
                  ? "profile-page-shell"
                  : "collection-page-shell"
            }
            tabIndex={-1}
            aria-label={
              activeWorkspace === "journal"
                ? "Journal"
                : activeWorkspace === "favorites"
                  ? "Favorites"
                  : activeWorkspace === "profile"
                    ? "Profile"
                    : "Watchlist"
            }
          >
            {activeWorkspace === "journal" && (
              <WatchHistoryPanel
                authToken={authState.token}
                refreshKey={watchRefreshKey}
                availableMoods={watchMemoryMoods}
                moodsLoading={watchMemoryMoodsLoading}
                moodsError={watchMemoryMoodsError}
                onChanged={handleWatchDataChanged}
                onDiscoverTitles={() => navigateToSection("catalog")}
              />
            )}
            {activeWorkspace === "watchlist" && (
              <WatchlistPanel
                authToken={authState.token}
                refreshKey={watchRefreshKey}
                onChanged={handleWatchDataChanged}
                onDiscoverTitles={() => navigateToSection("catalog")}
                onOpenTitle={openCollectionTitle}
              />
            )}
            {activeWorkspace === "favorites" && (
              <FavoritesPanel
                authToken={authState.token}
                refreshKey={watchRefreshKey}
                onChanged={handleWatchDataChanged}
                onBrowseTitles={() => navigateToSection("catalog")}
                onOpenTitle={openCollectionTitle}
              />
            )}
            {activeWorkspace === "profile" && (
              <ProfilePanel
                authToken={authState.token}
                initialProfile={authState.user}
                onProfileUpdated={handleProfileUpdated}
                onOpenTitle={openCollectionTitle}
              />
            )}
          </section>
        ) : authState && activeWorkspace === null ? (
          <section className="discover-page-shell" aria-labelledby="catalog-heading">
            <header className="discover-page-header">
              <h1 id="catalog-heading" tabIndex={-1}>Discover</h1>
              <p>Find something for your next watch.</p>
            </header>
            {renderCatalogSection(true, false, (
              <AuthenticatedDiscoverSections
                titles={baseTitles}
                moods={moods}
                authToken={authState.token}
                watchRefreshKey={watchRefreshKey}
                onViewAll={(mood) => {
                  handleFiltersChange({ ...effectiveFilters, mood });
                  window.setTimeout(() => focusSection("browse-all-heading"), 0);
                }}
                onOpenTitle={openTitle}
                onOpenWatchlistTitle={openCollectionTitle}
              />
            ))}
          </section>
        ) : (
          <>
            {authState && activeWorkspace && (
              <section ref={workspaceRef} className="workspace-shell" tabIndex={-1} aria-label="Personal workspace">
                {renderWorkspace()}
              </section>
            )}

            <HomeHero
              isAuthenticated={Boolean(authState)}
              onPrimaryAction={() => authState ? openWorkspace("journal") : openAuth("register")}
              onExploreMood={() => focusSection("mood-discovery")}
            />

            <MoodDiscoverySection
              titles={baseTitles}
              moods={moods}
              selectedMood={discoveryMood}
              loading={initialLoading}
              error={Boolean(catalogError) && !catalogReady}
              onSelectedMoodChange={setDiscoveryMood}
              onOpenTitle={openTitle}
              onViewAll={viewAllMoodMatches}
              onRetry={loadBaseTitles}
            />

            {renderCatalogSection(false)}

            <HowCineNotesWorks />

            {!authState && <FinalJournalCta onOpenAuth={openAuth} />}
          </>
        )}
      </main>

      {!authenticatedPageIsOpen && (!authState || activeWorkspace === "admin") && (
        <SiteFooter
          authState={authState}
          onOpenAuth={openAuth}
          onOpenWorkspace={openWorkspace}
          onNavigateToSection={navigateToSection}
        />
      )}

      {authDialogOpen && (
        <AuthDialog
          mode={authMode}
          onModeChange={setAuthMode}
          onAuthSuccess={handleAuthSuccess}
          onClose={closeAuth}
        />
      )}

      {selectedTitle && (
        <TitleDetailModal
          title={selectedTitle}
          authState={authState}
          availableMoods={watchMemoryMoods}
          moodsLoading={watchMemoryMoodsLoading}
          moodsError={watchMemoryMoodsError}
          focusIntent={titleFocusIntent}
          onWatchDataChanged={handleWatchDataChanged}
          onFocusIntentHandled={consumeTitleFocusIntent}
          onClose={closeTitle}
        />
      )}
    </div>
  );
}

function focusSection(sectionId: string) {
  const section = document.getElementById(sectionId);
  section?.focus({ preventScroll: true });
  section?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });
}

export default App;
