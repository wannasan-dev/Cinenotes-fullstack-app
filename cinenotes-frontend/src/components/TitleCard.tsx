import type { Title } from "../types/title";
import { getPosterSrc } from "../utils/poster";

type TitleCardProps = {
  title: Title;
  onViewReview: (title: Title) => void;
  onEdit?: (title: Title) => void;
  onDelete?: (title: Title) => void;
};

export function TitleCard({
  title,
  onViewReview,
  onEdit,
  onDelete,
}: TitleCardProps) {
  return (
    <article className="title-card">
      <div className="poster-wrapper">
        <img src={getPosterSrc(title.posterPath)} alt={title.name} />
        <span className="type-badge">{title.type}</span>
      </div>

      {(onEdit || onDelete) && (
        <div className="card-admin-actions">
          {onEdit && (
            <button className="edit-button" onClick={() => onEdit(title)}>
              Edit
            </button>
          )}

          {onDelete && (
            <button className="delete-button" onClick={() => onDelete(title)}>
              Delete
            </button>
          )}
        </div>
      )}

      <div className="title-card-content">
        <div className="card-meta">
          <span>{title.genres.map((genre) => genre.name).join(" / ") || "No genre"}</span>
          <span>{getReleaseYear(title.releaseDate)}</span>
        </div>

        <h2>{title.name}</h2>

        {title.tmdbVoteAverage !== null && (
          <p className="rating">TMDb {title.tmdbVoteAverage.toFixed(1)}/10</p>
        )}

        <p className="description">{title.overview || "No overview yet."}</p>

        {title.moodTags.length > 0 && (
          <p className="mood-tags">
            {title.moodTags.map((moodTag) => moodTag.name).join(" / ")}
          </p>
        )}

        <button
          className="review-button"
          onClick={() => onViewReview(title)}
        >
          View review
        </button>
      </div>
    </article>
  );
}

function getReleaseYear(releaseDate: string | null) {
  if (!releaseDate) {
    return "TBA";
  }

  return new Date(releaseDate).getFullYear();
}
