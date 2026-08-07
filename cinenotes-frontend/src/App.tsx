import { useEffect, useState} from "react";
import "./App.css";
import { deleteTitle, fetchTitles } from "./api/titleApi";
import { TitleCard } from "./components/TitleCard";
import type { Title } from "./types/title";
import { TitleDetailModal } from "./components/TitleDetailModal";
import { SearchControls } from "./components/SearchControls";
import { TypeFilterBar } from "./components/TypeFilterBar";
import { filterAndSortTitles } from "./utils/TitleUtils";
import { TitleForm } from "./components/TitleForm";
import LoginForm from "./components/LoginForm";
import {
  clearStoredAuth,
  getStoredAuth,
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
  const [editingTitle, setEditingTitle] = useState<Title | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
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


  async function handleDeleteTitle(titleToDelete: Title) {
    if (!authState) return;

    const shouldDelete = window.confirm(
      `Delete "${titleToDelete.name}" from CineNotes?`
    );

    if (!shouldDelete) return;

    try {
      await deleteTitle(titleToDelete.id, authState.token);
      setTitles((currentTitles) =>
        currentTitles.filter((title) => title.id !== titleToDelete.id)
      );

      if (selectedTitle?.id === titleToDelete.id) {
        setSelectedTitle(null);
      }

      if (editingTitle?.id === titleToDelete.id) {
        setEditingTitle(null);
        setIsFormOpen(false);
      }
    } catch {
      setError("Could not delete title.");
    }
  }

  function handleAuthSuccess(response: AuthResponse) {
    const nextAuthState = storeAuth(response);
    setAuthState(nextAuthState);
  }

  function handleLogout() {
    clearStoredAuth();
    setAuthState(null);
    setEditingTitle(null);
    setIsFormOpen(false);
  }

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

      {isAdminView && ( 
        <section className="admin-panel">
          <div>
            <p className="eyebrow">Admin tools</p>
            <h2>Manage titles</h2>
          </div>

          {!isFormOpen && (
            <button
              type="button"
              className="admin-add-button"
              onClick={() => {
                setEditingTitle(null);
                setIsFormOpen(true);
              }}
            >
              + Add title
            </button>
          )}
        </section>
      )}

      {isAdminView && authState && isFormOpen && (
        <TitleForm
          key={editingTitle ? `edit-${editingTitle.id}` : "create-title"}
          editingTitle={editingTitle}
          authToken={authState.token} 
          onCancelEdit={() => {
            setEditingTitle(null);
            setIsFormOpen(false);
          }}
          onTitleCreated={(createdTitle) => {
            setTitles((currentTitles) => [createdTitle, ...currentTitles]);
            setIsFormOpen(false);
          }}
          onTitleUpdated={(updatedTitle) => {
            setTitles((currentTitles) =>
              currentTitles.map((title) =>
                title.id === updatedTitle.id ? updatedTitle : title
              )
            );

            setEditingTitle(null);
            setIsFormOpen(false);
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
              onViewReview={setSelectedTitle}
              onEdit={
                isAdminView
                  ? (title) => {
                      setEditingTitle(title);
                      setIsFormOpen(true);
                    }
                  : undefined
              }
              onDelete={isAdminView ? handleDeleteTitle : undefined}
            />
          ))}
        </section>
      )}

      {selectedTitle && (
        <TitleDetailModal
          title={selectedTitle}
          onClose={() => setSelectedTitle(null)}
        />
      )}
    </main>
  );
}

export default App;
