import type { Title } from "../types/title";
import { getPosterSrc } from "../utils/poster";

type TitleCardProps = {
  title: Title;
  onOpenTitle: (title: Title) => void;
  compact?: boolean;
};

export function TitleCard({ title, onOpenTitle, compact = false }: TitleCardProps) {
  const year = getReleaseYear(title.releaseDate);
  const typeLabel = title.type === "MOVIE" ? "Movie" : "Series";
  const accessibleName = `${title.name}, ${year}, ${typeLabel}`;

  return (
    <article className={compact ? "title-card compact" : "title-card"}>
      <button
        className="title-card-button"
        type="button"
        aria-label={`Open ${accessibleName}`}
        onClick={() => onOpenTitle(title)}
      >
        <div className="poster-wrapper">
          <img src={getPosterSrc(title.posterPath)} alt="" />
          <span className="type-badge">{typeLabel}</span>
        </div>

        <div className="title-card-content">
          <p className="card-year">{year}</p>
          <h3>{title.name}</h3>

          {title.moodTags.length > 0 && (
            <div className="card-moods" aria-label="Moods">
              {title.moodTags.slice(0, 2).map((moodTag) => (
                <span key={moodTag.id}>{moodTag.name}</span>
              ))}
            </div>
          )}

          {title.tmdbVoteAverage !== null && (
            <p className="card-rating">TMDb {title.tmdbVoteAverage.toFixed(1)}</p>
          )}
        </div>
      </button>
    </article>
  );
}

function getReleaseYear(releaseDate: string | null) {
  if (!releaseDate) return "TBA";
  return new Date(releaseDate).getFullYear();
}
