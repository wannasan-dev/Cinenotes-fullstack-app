

type SearchControlsProps = {
  searchText: string;
  onSearchTextChange: (value: string) => void;
  selectedGenre: string;
  onSelectedGenreChange: (value: string) => void;
  genres: string[];
  selectedMood: string;
  onSelectedMoodChange: (value: string) => void;
  moods: string[];
  sortOption: string;
  onSortOptionChange: (value: string) => void;
};

export function SearchControls({
  searchText,
  onSearchTextChange,
  selectedGenre,
  onSelectedGenreChange,
  genres,
  selectedMood,
  onSelectedMoodChange,
  moods,
  sortOption,
  onSortOptionChange,
}: SearchControlsProps) {
    return(
        <section className="search-section">
        <input
          className="search-input"
          type="text"
          placeholder="Search by title..."
          value={searchText}
          onChange={(event) => onSearchTextChange(event.target.value)}
        />
        <select
          className="genre-select"
          value={selectedGenre}
          onChange={(event) => onSelectedGenreChange(event.target.value)}
        >
          <option value="ALL">All genres</option>
          
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>

        <select
          className="genre-select"
          value={selectedMood}
          onChange={(event) => onSelectedMoodChange(event.target.value)}
        >
          <option value="ALL">All moods</option>

          {moods.map((mood) => (
            <option key={mood} value={mood}>
              {mood}
            </option>
          ))}
        </select>

        <select
          className="sort-select"
          value={sortOption}
          onChange={(event) => onSortOptionChange(event.target.value)}
        >
          <option value="LATEST">Latest added</option>
          <option value="YEAR">Newest released</option>
          <option value="RATING">Highest TMDb rated</option>
        </select>
      </section>
    );

}
