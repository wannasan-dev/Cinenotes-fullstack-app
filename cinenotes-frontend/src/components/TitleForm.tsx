import { useImmer } from "use-immer";
import { createTitle, updateTitle, type TitleRequest } from "../api/titleApi";
import type { Title } from "../types/title";
import { useEffect, useState, } from "react";
import type { FormEvent } from "react";

type TitleFormProps = {
  editingTitle: Title | null;
  authToken: string;
  onCancelEdit: () => void;
  onTitleCreated: (title: Title) => void;
  onTitleUpdated: (title: Title) => void;
};

type TitleFormData = {
  type: "MOVIE" | "SERIES";
  name: string;
  genres: string[];
  rating: string;
  description: string;
  releaseYear: string;
  posterUrl: string;
  reviewText: string;
};

const initialFormData: TitleFormData = {
  type: "MOVIE",
  name: "",
  genres: [],
  rating: "",
  description: "",
  releaseYear: String(new Date().getFullYear()),
  posterUrl: "",
  reviewText: "",
};

const genreOptions = [
  "ACTION",
  "COMEDY",
  "CRIME",
  "DRAMA",
  "FANTASY",
  "HORROR",
  "MYSTERY",
  "ROMANCE",
  "SCI_FI",
  "THRILLER",
];

export function TitleForm({
  editingTitle,
  authToken,
  onCancelEdit,
  onTitleCreated,
  onTitleUpdated,
}: TitleFormProps) {
  const [formData, updateFormData] = useImmer<TitleFormData>(initialFormData);
  const [selectedGenreToAdd, setSelectedGenreToAdd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
  if (editingTitle) {
    updateFormData(() => ({
      type: editingTitle.type,
      name: editingTitle.name,
      genres: editingTitle.genres,
      rating: String(editingTitle.rating),
      description: editingTitle.description,
      releaseYear: String(editingTitle.releaseYear),
      posterUrl: editingTitle.posterUrl,
      reviewText: editingTitle.reviewText,
    }));
  } else {
    updateFormData(() => initialFormData);
  }
}, [editingTitle, updateFormData]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  try {
    setSubmitting(true);
    setSubmitError("");

    const request: TitleRequest = {
    ...formData,
    rating: Number(formData.rating),
    releaseYear: Number(formData.releaseYear),
    };

    if (editingTitle) {
      const updatedTitle = await updateTitle(editingTitle.id, request, authToken);
      onTitleUpdated(updatedTitle);
    } else {
      const createdTitle = await createTitle(request, authToken);
      onTitleCreated(createdTitle);
    }

    updateFormData(() => initialFormData);
  } catch (error) {
    setSubmitError("Could not create title. Please check the form.");
  } finally {
    setSubmitting(false);
  }
}

function handleAddGenre() {
  if (!selectedGenreToAdd) return;

  updateFormData((draft) => {
    if (!draft.genres.includes(selectedGenreToAdd)) {
      draft.genres.push(selectedGenreToAdd);
    }
  });

  setSelectedGenreToAdd("");
}


  return (
    <section className="title-form-card">
      <button
        type="button"
        className="form-close-button"
        onClick={onCancelEdit}
        aria-label="Close form"
      >
        ×
      </button>
      <h2>{editingTitle ? "Edit title" : "Add new title"}</h2>

      <form className="title-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            value={formData.name}
            onChange={(event) =>
              updateFormData((draft) => {
                draft.name = event.target.value;
              })
            }
          />
        </label>

        <label>
          Type
          <select
            value={formData.type}
            onChange={(event) =>
              updateFormData((draft) => {
                draft.type = event.target.value as "MOVIE" | "SERIES";
              })
            }
          >
            <option value="MOVIE">Movie</option>
            <option value="SERIES">Series</option>
          </select>
        </label>

       <div className="genre-field">
        <label htmlFor="genre-select">Genre</label>

        <div className="genre-add-row">
                <select
                id="genre-select"
                value={selectedGenreToAdd}
                onChange={(event) => setSelectedGenreToAdd(event.target.value)}
                >
                <option value="">Choose genre</option>
                {genreOptions.map((genre) => (
                    <option key={genre} value={genre}>
                    {genre}
                    </option>
                ))}
                </select>

                <button type="button" className="small-button" onClick={handleAddGenre}>
                Add
                </button>
            </div>

            {formData.genres.length > 0 && (
                <div className="selected-genres">
                {formData.genres.map((genre) => (
                    <button
                    type="button"
                    className="genre-chip"
                    key={genre}
                    onClick={() =>
                        updateFormData((draft) => {
                        draft.genres = draft.genres.filter((g) => g !== genre);
                        })
                    }
                    >
                    {genre} ×
                    </button>
                ))}
                </div>
            )}
            </div>

        <label>
          Rating
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={formData.rating}
            onChange={(event) =>
                updateFormData((draft) => {
                draft.rating = event.target.value;
                })
            }
        />
        </label>

        <label>
          Release Year
          <input
            type="number"
            value={formData.releaseYear}
            onChange={(event) =>
                updateFormData((draft) => {
                draft.releaseYear = event.target.value;
                })
            }
            />
        </label>

        <label className="form-full">
          Poster URL
          <input
            type="text"
            placeholder="/posters/shutter-island.jpg"
            value={formData.posterUrl}
            onChange={(event) =>
              updateFormData((draft) => {
                draft.posterUrl = event.target.value;
              })
            }
          />
        </label>

        <label>
          Description
          <textarea
            value={formData.description}
            onChange={(event) =>
              updateFormData((draft) => {
                draft.description = event.target.value;
              })
            }
          />
        </label>

        <label>
          Review
          <textarea
            value={formData.reviewText}
            onChange={(event) =>
              updateFormData((draft) => {
                draft.reviewText = event.target.value;
              })
            }
          />
        </label>

        {submitError && <p className="form-error">{submitError}</p>}
        <div className="form-actions">
            <button type="submit" disabled={submitting}>
            {submitting
                ? "Saving..."
                : editingTitle
                ? "Update title"
                : "Add title"}
            </button>
        </div>
      </form>
    </section>
  );
}