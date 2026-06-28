type FilterBarProps = {
  selectedType: "ALL" | "MOVIE" | "SERIES";
  onSelectedTypeChange: (type: "ALL" | "MOVIE" | "SERIES") => void;
};

export function TypeFilterBar({ selectedType, onSelectedTypeChange }: FilterBarProps) {
    return(
        <section className="filter-bar">
        <button
          className={selectedType === "ALL" ? "filter-button active" : "filter-button"}
          onClick={() => onSelectedTypeChange("ALL")}
        >
          All
        </button>

        <button
          className={selectedType === "MOVIE" ? "filter-button active" : "filter-button"}
          onClick={() => onSelectedTypeChange("MOVIE")}
        >
          Movies
        </button>

        <button
          className={selectedType === "SERIES" ? "filter-button active" : "filter-button"}
          onClick={() => onSelectedTypeChange("SERIES")}
        >
          Series
        </button>
      </section> 

    )
}