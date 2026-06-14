import { useEffect, useState } from "react";
import "./App.css";
import { fetchTitles } from "./api/titleApi";
import { TitleCard } from "./components/TitleCard";
import type { Title } from "./types/title";

function App() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState<"ALL" | "MOVIE" | "SERIES">("ALL");
  const [searchText, setSearchText] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("ALL");
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const [sortOption, setSortOption] = useState("LATEST");

  useEffect(() => {
    async function loadTitles() {
      try {
        const data = await fetchTitles();
        setTitles(data);
      } catch (err) {
        setError("Could not load titles.");
      } finally {
        setLoading(false);
      }
    }

    loadTitles(); 
  }, []);

  const genres = Array.from(
  new Set(titles.flatMap((title) => title.genres))
  );

  const filteredTitles = titles.filter((title) => {
    const matchesType =
      selectedType === "ALL" || title.type === selectedType;

    const matchesSearch =
      title.name.toLowerCase().includes(searchText.toLowerCase());

    const matchesGenre =
      selectedGenre === "ALL" || title.genres.includes(selectedGenre);

    return matchesType && matchesSearch && matchesGenre;
  });

  const sortedTitles = [...filteredTitles];
  if (sortOption === "RATING") {
    sortedTitles.sort((a, b) => b.rating - a.rating);
  } else if (sortOption === "YEAR") {
    sortedTitles.sort((a, b) => b.releaseYear - a.releaseYear);
  } else if (sortOption === "LATEST") {
    sortedTitles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

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

      <section className="filter-bar">
        <button
          className={selectedType === "ALL" ? "filter-button active" : "filter-button"}
          onClick={() => setSelectedType("ALL")}
        >
          All
        </button>

        <button
          className={selectedType === "MOVIE" ? "filter-button active" : "filter-button"}
          onClick={() => setSelectedType("MOVIE")}
        >
          Movies
        </button>

        <button
          className={selectedType === "SERIES" ? "filter-button active" : "filter-button"}
          onClick={() => setSelectedType("SERIES")}
        >
          Series
        </button>
      </section> 

      <section className="search-section">
        <input
          className="search-input"
          type="text"
          placeholder="Search by title..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        <select
          className="genre-select"
          value={selectedGenre}
          onChange={(event) => setSelectedGenre(event.target.value)}
        >
          <option value="ALL">All genres</option>
          
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>

        <select
          className="sort-select"
          value={sortOption}
          onChange={(event) => setSortOption(event.target.value)}
        >
          <option value="LATEST">Latest added</option>
          <option value="YEAR">Newest released</option>
          <option value="RATING">Highest rated</option>
        </select>
      </section>

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
          />
        ))}
      </section>
      )}

    {selectedTitle && (
      <div className="modal-backdrop" onClick={() => setSelectedTitle(null)}>
        <div className="review-modal" onClick={(event) => event.stopPropagation()}>
          <button
            className="modal-close-button"
            onClick={() => setSelectedTitle(null)}
            >
            ✕
          </button> 

          <div className="modal-content">
            <img src={selectedTitle.posterUrl} alt={selectedTitle.name} />
              <div>
                <p className="eyebrow">{selectedTitle.type}</p>
                  <h2>{selectedTitle.name}</h2>
                <p className="modal-meta">
                  {selectedTitle.genres.join(" / ")} • {selectedTitle.releaseYear}
                </p>
                <p className="rating">⭐ {selectedTitle.rating}/10</p>
                  <h3>Review</h3>
                <p className="review-text">{selectedTitle.reviewText}</p>
              </div>
          </div>
        </div> 
      </div>
    )}
    </main>
  );
}

export default App;