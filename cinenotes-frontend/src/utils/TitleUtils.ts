import type { Title } from "../types/title";

type FilterAndSortOptions = {
  selectedType: "ALL" | "MOVIE" | "SERIES";
  searchText: string;
  selectedGenre: string;
  selectedMood: string;
  sortOption: string;
}; 

export function filterAndSortTitles(
  titles: Title[],
  options: FilterAndSortOptions
): Title[] {
  const { selectedType, searchText, selectedGenre, selectedMood, sortOption } = options;

  const filteredTitles = titles.filter((title) => {
    const matchesType =
      selectedType === "ALL" || title.type === selectedType;

    const matchesSearch =
      title.name.toLowerCase().includes(searchText.toLowerCase());

    const matchesGenre =
      selectedGenre === "ALL" ||
      title.genres.some((genre) => genre.name === selectedGenre);

    const matchesMood =
      selectedMood === "ALL" ||
      title.moodTags.some((moodTag) => moodTag.name === selectedMood);

    return matchesType && matchesSearch && matchesGenre && matchesMood;
  });

  const sortedTitles = [...filteredTitles];

  if (sortOption === "RATING") {
    sortedTitles.sort(
      (a, b) => (b.tmdbVoteAverage ?? -1) - (a.tmdbVoteAverage ?? -1)
    );
  } else if (sortOption === "YEAR") {
    sortedTitles.sort(
      (a, b) =>
        new Date(b.releaseDate ?? "0000-01-01").getTime() -
        new Date(a.releaseDate ?? "0000-01-01").getTime()
    );
  } else if (sortOption === "LATEST") {
    sortedTitles.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return sortedTitles;
}
