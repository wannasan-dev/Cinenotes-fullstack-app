const TMDB_IMAGE_BASE_URL =
  import.meta.env.VITE_TMDB_IMAGE_BASE_URL?.replace(/\/$/, "") ??
  "https://image.tmdb.org/t/p/w500";

export function getPosterSrc(posterPath: string | null | undefined) {
  if (!posterPath) {
    return "/posters/shutter-island.png";
  }

  if (posterPath.startsWith("http://") || posterPath.startsWith("https://")) {
    return posterPath;
  }

  if (posterPath.startsWith("/posters/")) {
    return posterPath;
  }

  if (posterPath.startsWith("/")) {
    return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
  }

  return posterPath;
}
