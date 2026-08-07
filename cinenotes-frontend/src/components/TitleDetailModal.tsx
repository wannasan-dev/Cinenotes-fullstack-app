import type { Title } from "../types/title";
import { getPosterSrc } from "../utils/poster";


type TitleDetailModalProps = {
  title: Title;
  onClose: () => void;
};

export function TitleDetailModal({ title, onClose }: TitleDetailModalProps) {
    return(

     <div className="modal-backdrop" onClick={() => onClose}>
        <div className="review-modal" onClick={(event) => event.stopPropagation()}>
          <button
            className="modal-close-button"
            onClick={() => onClose()}
            >
            ✕
          </button> 

          <div className="modal-content">
            <img src={getPosterSrc(title.posterPath)} alt={title.name} />
              <div>
                <p className="eyebrow">{title.type}</p>
                  <h2>{title.name}</h2>
                {title.originalName && title.originalName !== title.name && (
                  <p className="modal-meta">{title.originalName}</p>
                )}
                <p className="modal-meta">
                  {title.genres.map((genre) => genre.name).join(" / ") || "No genre"} •{" "}
                  {title.releaseDate || "Release date TBA"}
                </p>
                <p className="modal-meta">
                  {title.runtimeMinutes ? `${title.runtimeMinutes} min` : "Runtime TBA"} •{" "}
                  {title.originalLanguage || "Language TBA"} • {title.country || "Country TBA"}
                </p>
                {title.tmdbVoteAverage !== null && (
                  <p className="rating">
                    TMDb {title.tmdbVoteAverage.toFixed(1)}/10
                    {title.tmdbVoteCount !== null ? ` (${title.tmdbVoteCount} votes)` : ""}
                  </p>
                )}
                {title.moodTags.length > 0 && (
                  <p className="mood-tags">
                    {title.moodTags.map((moodTag) => moodTag.name).join(" / ")}
                  </p>
                )}
                  <h3>Overview</h3>
                <p className="review-text">{title.overview || "No overview available yet."}</p>
                <h3>Coming next</h3>
                <p className="review-text">Reviews, watchlist actions, and watch logs will connect here in later phases.</p>
              </div>
          </div>
        </div> 
      </div>
    );
}
