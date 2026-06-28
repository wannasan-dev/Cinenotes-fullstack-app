import type { Title } from "../types/title";


type ReviewModalProps = {
  title: Title;
  onClose: () => void;
};

export function ReviewModal({ title, onClose }: ReviewModalProps) {
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
            <img src={title.posterUrl} alt={title.name} />
              <div>
                <p className="eyebrow">{title.type}</p>
                  <h2>{title.name}</h2>
                <p className="modal-meta">
                  {title.genres.join(" / ")} • {title.releaseYear}
                </p>
                <p className="rating">⭐ {title.rating}/10</p>
                  <h3>Review</h3>
                <p className="review-text">{title.reviewText}</p>
              </div>
          </div>
        </div> 
      </div>
    );
}