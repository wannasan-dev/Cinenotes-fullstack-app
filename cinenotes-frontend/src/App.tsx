import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { fetchTitles } from "./api/titleApi";
import { clearStoredAuth, getStoredAuth, storeAuth, storeAuthUser } from "./auth/authStorage";
import { AdminDashboard } from "./components/AdminDashboard";
import { AuthDialog } from "./components/AuthDialog";
import {
  CatalogSection,
  type CatalogFilters,
} from "./components/CatalogSection";
import { GlobalHeader, type Workspace } from "./components/GlobalHeader";
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
import type { Title } from "./types/title";
import { filterAndSortTitles } from "./utils/TitleUtils";

const DEFAULT_FILTERS: CatalogFilters = {
  type: "ALL",
  genre: "ALL",
  mood: "ALL",
  sort: "LATEST",
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
  const [lastAppliedFilter, setLastAppliedFilter] =
    useState<keyof CatalogFilters | "search" | null>(null);
  const [discoveryMood, setDiscoveryMood] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(null);
  const [watchRefreshKey, setWatchRefreshKey] = useState(0);
  const [authState, setAuthState] = useState<AuthState | null>(() => getStoredAuth());
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const catalogRequestIdRef = useRef(0);
  const authReturnFocusRef = useRef<HTMLElement | null>(null);
  const workspaceRef = useRef<HTMLElement>(null);

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

  const visibleTitles = useMemo(
    () =>
      filterAndSortTitles(hasServerFilters ? catalogSourceTitles : baseTitles, {
        selectedType: filters.type,
        searchText: appliedSearchText,
        selectedGenre: filters.genre,
        selectedMood: filters.mood,
        sortOption: filters.sort,
      }),
    [appliedSearchText, baseTitles, catalogSourceTitles, filters, hasServerFilters]
  );

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
  }

  const handleProfileUpdated = useCallback((profile: AuthState["user"]) => {
    const nextAuthState = storeAuthUser(profile);
    if (nextAuthState) setAuthState(nextAuthState);
  }, []);

  const handleWatchDataChanged = useCallback(() => {
    setWatchRefreshKey((currentKey) => currentKey + 1);
  }, []);

  const openTitle = useCallback((title: Title) => {
    setSelectedTitle(title);
  }, []);

  const closeTitle = useCallback(() => {
    setSelectedTitle(null);
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
    window.setTimeout(() => focusSection(sectionId), 0);
  }

  function handleFiltersChange(nextFilters: CatalogFilters) {
    const changedKey = (Object.keys(nextFilters) as Array<keyof CatalogFilters>).find(
      (key) => nextFilters[key] !== filters[key]
    );
    if (changedKey && changedKey !== "sort") setLastAppliedFilter(changedKey);
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
    setFilters(DEFAULT_FILTERS);
    setLastAppliedFilter(null);
    setCatalogUpdating(false);
    setCatalogError("");
  }

  function removeMostRecentFilter() {
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
    window.setTimeout(() => focusSection("catalog"), 0);
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

    if (activeWorkspace === "profile") {
      return (
        <ProfilePanel
          authToken={authState.token}
          initialProfile={authState.user}
          onProfileUpdated={handleProfileUpdated}
        />
      );
    }

    if (activeWorkspace === "watchlist") {
      return (
        <WatchlistPanel
          authToken={authState.token}
          refreshKey={watchRefreshKey}
          onChanged={handleWatchDataChanged}
        />
      );
    }

    if (activeWorkspace === "journal") {
      return (
        <WatchHistoryPanel
          authToken={authState.token}
          refreshKey={watchRefreshKey}
          onChanged={handleWatchDataChanged}
        />
      );
    }

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

        <CatalogSection
          titles={visibleTitles}
          genres={genres}
          moods={moods}
          searchText={searchText}
          filters={filters}
          initialLoading={initialLoading}
          updating={catalogUpdating}
          error={catalogError}
          lastAppliedFilter={lastAppliedFilter}
          onSearchTextChange={handleSearchTextChange}
          onFiltersChange={handleFiltersChange}
          onClearSearch={() => {
            catalogRequestIdRef.current += 1;
            setSearchText("");
            setAppliedSearchText("");
            setCatalogUpdating(false);
            if (filters.type === "ALL" && filters.genre === "ALL") setCatalogError("");
          }}
          onClearAll={clearAllFilters}
          onRemoveMostRecentFilter={removeMostRecentFilter}
          onRetry={retryCatalog}
          onOpenTitle={openTitle}
        />

        <HowCineNotesWorks />

        {!authState && <FinalJournalCta onOpenAuth={openAuth} />}
      </main>

      <SiteFooter
        authState={authState}
        onOpenAuth={openAuth}
        onOpenWorkspace={openWorkspace}
        onNavigateToSection={navigateToSection}
      />

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
          onWatchDataChanged={handleWatchDataChanged}
          onClose={closeTitle}
        />
      )}
    </div>
  );
}

function focusSection(sectionId: string) {
  const section = document.getElementById(sectionId);
  section?.focus({ preventScroll: true });
  section?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default App;
