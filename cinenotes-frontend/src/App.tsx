import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { fetchTitles } from "./api/titleApi";
import { AdminDashboard } from "./components/AdminDashboard";
import { TitleCard } from "./components/TitleCard";
import type { Title } from "./types/title";
import { TitleDetailModal } from "./components/TitleDetailModal";
import { ProfilePanel } from "./components/ProfilePanel";
import { WatchHistoryPanel } from "./components/WatchHistoryPanel";
import { WatchlistPanel } from "./components/WatchlistPanel";
import { SearchControls } from "./components/SearchControls";
import { TypeFilterBar } from "./components/TypeFilterBar";
import { filterAndSortTitles } from "./utils/TitleUtils";
import LoginForm from "./components/LoginForm";
import {
  clearStoredAuth,
  getStoredAuth,
  storeAuthUser,
  storeAuth,
} from "./auth/authStorage";
import type { AuthResponse, AuthState } from "./types/auth";
import type { TitleType } from "./types/title";

function App() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] =
    useState<"ALL" | TitleType>("ALL");
  const [searchText, setSearchText] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("ALL");
  const [selectedMood, setSelectedMood] = useState("ALL");
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const [sortOption, setSortOption] = useState("LATEST");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isWatchHistoryOpen, setIsWatchHistoryOpen] = useState(false);
  const [watchRefreshKey, setWatchRefreshKey] = useState(0);
  const [authState, setAuthState] = useState<AuthState | null>(() =>
    getStoredAuth()
  );
  const isLoggedIn = authState !== null;
  const isAdminView = authState?.user.role === "ADMIN";

  useEffect(() => {  
    async function loadTitles() {
      try { 
        setLoading(true);
        const data = await fetchTitles({
          type: selectedType === "ALL" ? undefined : selectedType,
          genre: selectedGenre === "ALL" ? undefined : selectedGenre,
          keyword: searchText.trim() === "" ? undefined : searchText.trim(),
        });
        setTitles(data);
        setError("");
      } catch {
        setError("Could not load titles.");
      } finally {
        setLoading(false);
      }
    }
    loadTitles();
  }, [selectedGenre, searchText, selectedType]);
  function handleAuthSuccess(response: AuthResponse) {
    const nextAuthState = storeAuth(response);
    setAuthState(nextAuthState);
    setIsProfileOpen(false);
  }

  function handleLogout() {
    clearStoredAuth();
    setAuthState(null);
    setIsProfileOpen(false);
    setIsWatchlistOpen(false);
    setIsWatchHistoryOpen(false);
  }

  const handleProfileUpdated = useCallback((profile: AuthState["user"]) => {
    const nextAuthState = storeAuthUser(profile);
    if (nextAuthState) {
      setAuthState(nextAuthState);
    }
  }, []);

  const handleWatchDataChanged = useCallback(() => {
    setWatchRefreshKey((currentKey) => currentKey + 1);
  }, []);

  const genres = Array.from(
    new Set(titles.flatMap((title) => title.genres.map((genre) => genre.name)))
  );
  const moods = Array.from(
    new Set(titles.flatMap((title) => title.moodTags.map((moodTag) => moodTag.name)))
  );

  const sortedTitles = filterAndSortTitles(titles, {
    selectedType,
    searchText,
    selectedGenre,
    selectedMood,
    sortOption,
  });

  if (loading) {
    return <p className="status-message">Loading titles...</p>;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }
  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">Personal movie and series notes</p>
        <h1>CineNotes</h1>
        <p className="hero-text">
          Curated reviews for movies and series, with ratings, genres,
          and personal notes.
        </p>
      </section>

      <div className="mode-banner">
        <span className="mode-badge">
          {isAdminView ? "Admin Dashboard" : isLoggedIn ? "User View" : "Public View"}
        </span>
      </div>

      <div className="session-panel">

        {authState ? (
          <>
            <span className="admin-identity">
              Logged in as {authState.user.displayName || authState.user.username}
            </span>

            <button
              type="button"
              className="profile-toggle-button"
              onClick={() => setIsProfileOpen((isOpen) => !isOpen)}
            >
              Profile
            </button>

            <button
              type="button"
              className="profile-toggle-button"
              onClick={() => setIsWatchlistOpen((isOpen) => !isOpen)}
            >
              Watchlist
            </button>

            <button
              type="button"
              className="profile-toggle-button"
              onClick={() => setIsWatchHistoryOpen((isOpen) => !isOpen)}
            >
              History
            </button>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <LoginForm onAuthSuccess={handleAuthSuccess} />
        )}
      </div>

      {authState && isProfileOpen && (
        <ProfilePanel
          authToken={authState.token}
          initialProfile={authState.user}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {authState && isWatchlistOpen && (
        <WatchlistPanel
          authToken={authState.token}
          refreshKey={watchRefreshKey}
          onChanged={handleWatchDataChanged}
        />
      )}

      {authState && isWatchHistoryOpen && (
        <WatchHistoryPanel
          authToken={authState.token}
          refreshKey={watchRefreshKey}
          onChanged={handleWatchDataChanged}
        />
      )}

      {isAdminView && authState && (
        <AdminDashboard
          authToken={authState.token}
          titles={titles}
          onTitleCreated={(createdTitle) =>
            setTitles((currentTitles) => [createdTitle, ...currentTitles])
          }
          onTitleUpdated={(updatedTitle) =>
            setTitles((currentTitles) =>
              currentTitles.map((title) =>
                title.id === updatedTitle.id ? updatedTitle : title
              )
            )
          }
          onTitleDeleted={(titleId) => {
            setTitles((currentTitles) =>
              currentTitles.filter((title) => title.id !== titleId)
            );
            if (selectedTitle?.id === titleId) {
              setSelectedTitle(null);
            }
          }}
        />
      )}

      <TypeFilterBar
        selectedType={selectedType}
        onSelectedTypeChange={setSelectedType}
      />

      <SearchControls
        searchText={searchText}
        onSearchTextChange={setSearchText}
        selectedGenre={selectedGenre}
        onSelectedGenreChange={setSelectedGenre}
        genres={genres}
        selectedMood={selectedMood}
        onSelectedMoodChange={setSelectedMood}
        moods={moods}
        sortOption={sortOption}
        onSortOptionChange={setSortOption}
      />

      <section className="section-header">
        <div>
          <h2>Latest recommendations</h2>
          <p>{sortedTitles.length} titles</p>
        </div>
      </section>

      {sortedTitles.length === 0 ? (
        <div className="empty-state">
          <h3>No titles found</h3>
          <p>Try changing the search keyword.</p>
        </div>
      ) : (
        <section className="title-grid">
          {sortedTitles.map((title) => (
            <TitleCard
              key={title.id}
              title={title}
              onViewDetails={setSelectedTitle}
            />
          ))}
        </section>
      )}

      {selectedTitle && (
        <TitleDetailModal
          title={selectedTitle}
          authState={authState}
          onWatchDataChanged={handleWatchDataChanged}
          onClose={() => setSelectedTitle(null)}
        />
      )}
    </main>
  );
}

export default App;
