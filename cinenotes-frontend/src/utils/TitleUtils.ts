import type { Title } from "../types/title";

type FilterAndSortOptions = {
  selectedType: "ALL" | "MOVIE" | "SERIES";
  searchText: string;
  selectedGenre: string;
  sortOption: string;
}; 

export function filterAndSortTitles(
  titles: Title[],
  options: FilterAndSortOptions
): Title[] {
  const { selectedType, searchText, selectedGenre, sortOption } = options;

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
    sortedTitles.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return sortedTitles;
}