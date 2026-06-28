import type { Title } from "../types/title";

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
        <img src={title.posterUrl} alt={title.name} />
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
          <span>{title.genres.join(" / ")}</span>
          <span>{title.releaseYear}</span>
        </div>

        <h2>{title.name}</h2>

        <p className="rating">⭐ {title.rating}/10</p>

        <p className="description">{title.description}</p>

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
