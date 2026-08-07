import { useEffect, useState, type FormEvent } from "react";
import {
  createTitle,
  fetchAdminGenres,
  fetchAdminMoodTags,
  updateTitle,
  type TitleRequest,
} from "../api/titleApi";
import type { GenreResponse, MoodTagResponse, Title, TitleType } from "../types/title";

type TitleFormProps = {
  editingTitle: Title | null;
  authToken: string;
  onCancelEdit: () => void;
  onTitleCreated: (title: Title) => void;
  onTitleUpdated: (title: Title) => void;
};

type TitleFormData = {
  tmdbId: string;
  type: TitleType;
  name: string;
  originalName: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseDate: string;
  runtimeMinutes: string;
  originalLanguage: string;
  country: string;
  tmdbVoteAverage: string;
  tmdbVoteCount: string;
  genreIds: number[];
  moodTagIds: number[];
};

const initialFormData: TitleFormData = {
  tmdbId: "",
  type: "MOVIE",
  name: "",
  originalName: "",
  overview: "",
  posterPath: "",
  backdropPath: "",
  releaseDate: "",
  runtimeMinutes: "",
  originalLanguage: "",
  country: "",
  tmdbVoteAverage: "",
  tmdbVoteCount: "",
  genreIds: [],
  moodTagIds: [],
};

export function TitleForm({
  editingTitle,
  authToken,
  onCancelEdit,
  onTitleCreated,
  onTitleUpdated,
}: TitleFormProps) {
  const [formData, setFormData] = useState<TitleFormData>(() =>
    toFormData(editingTitle)
  );
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  const [moodTags, setMoodTags] = useState<MoodTagResponse[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [genreOptions, moodOptions] = await Promise.all([
          fetchAdminGenres(authToken),
          fetchAdminMoodTags(authToken),
        ]);
        setGenres(genreOptions);
        setMoodTags(moodOptions);
      } catch {
        setSubmitError("Could not load genre and mood options.");
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, [authToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setSubmitError("");

      const request = toTitleRequest(formData);

      if (editingTitle) {
        const updatedTitle = await updateTitle(editingTitle.id, request, authToken);
        onTitleUpdated(updatedTitle);
      } else {
        const createdTitle = await createTitle(request, authToken);
        onTitleCreated(createdTitle);
      }

      setFormData(initialFormData);
    } catch {
      setSubmitError("Could not save title. Please check the form.");
    } finally {
      setSubmitting(false);
    }
  }

  function updateField<Key extends keyof TitleFormData>(
    key: Key,
    value: TitleFormData[Key]
  ) {
    setFormData((currentData) => ({
      ...currentData,
      [key]: value,
    }));
  }

  function toggleId(key: "genreIds" | "moodTagIds", id: number) {
    setFormData((currentData) => {
      const ids = currentData[key];
      return {
        ...currentData,
        [key]: ids.includes(id)
          ? ids.filter((currentId) => currentId !== id)
          : [...ids, id],
      };
    });
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
            onChange={(event) => updateField("name", event.target.value)}
          />
        </label>

        <label>
          Type
          <select
            value={formData.type}
            onChange={(event) => updateField("type", event.target.value as TitleType)}
          >
            <option value="MOVIE">Movie</option>
            <option value="SERIES">Series</option>
          </select>
        </label>

        <label>
          TMDb ID
          <input
            type="number"
            value={formData.tmdbId}
            onChange={(event) => updateField("tmdbId", event.target.value)}
          />
        </label>

        <label>
          Original name
          <input
            type="text"
            value={formData.originalName}
            onChange={(event) => updateField("originalName", event.target.value)}
          />
        </label>

        <label>
          Release date
          <input
            type="date"
            value={formData.releaseDate}
            onChange={(event) => updateField("releaseDate", event.target.value)}
          />
        </label>

        <label>
          Runtime minutes
          <input
            type="number"
            min="1"
            value={formData.runtimeMinutes}
            onChange={(event) => updateField("runtimeMinutes", event.target.value)}
          />
        </label>

        <label>
          Original language
          <input
            type="text"
            value={formData.originalLanguage}
            onChange={(event) => updateField("originalLanguage", event.target.value)}
          />
        </label>

        <label>
          Country
          <input
            type="text"
            value={formData.country}
            onChange={(event) => updateField("country", event.target.value)}
          />
        </label>

        <label>
          TMDb vote average
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={formData.tmdbVoteAverage}
            onChange={(event) => updateField("tmdbVoteAverage", event.target.value)}
          />
        </label>

        <label>
          TMDb vote count
          <input
            type="number"
            min="0"
            value={formData.tmdbVoteCount}
            onChange={(event) => updateField("tmdbVoteCount", event.target.value)}
          />
        </label>

        <label className="form-full">
          Poster path
          <input
            type="text"
            placeholder="/abc123.jpg or https://..."
            value={formData.posterPath}
            onChange={(event) => updateField("posterPath", event.target.value)}
          />
        </label>

        <label className="form-full">
          Backdrop path
          <input
            type="text"
            value={formData.backdropPath}
            onChange={(event) => updateField("backdropPath", event.target.value)}
          />
        </label>

        <label className="form-full">
          Overview
          <textarea
            value={formData.overview}
            onChange={(event) => updateField("overview", event.target.value)}
          />
        </label>

        <fieldset className="option-fieldset">
          <legend>Genres</legend>
          {loadingOptions ? (
            <p>Loading genres...</p>
          ) : (
            genres.map((genre) => (
              <label key={genre.id} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={formData.genreIds.includes(genre.id)}
                  onChange={() => toggleId("genreIds", genre.id)}
                />
                {genre.name}
              </label>
            ))
          )}
        </fieldset>

        <fieldset className="option-fieldset">
          <legend>Mood tags</legend>
          {loadingOptions ? (
            <p>Loading moods...</p>
          ) : (
            moodTags.map((moodTag) => (
              <label key={moodTag.id} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={formData.moodTagIds.includes(moodTag.id)}
                  onChange={() => toggleId("moodTagIds", moodTag.id)}
                />
                {moodTag.name}
              </label>
            ))
          )}
        </fieldset>

        {submitError && <p className="form-error">{submitError}</p>}
        <div className="form-actions">
          <button type="submit" disabled={submitting || loadingOptions}>
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

function toFormData(title: Title | null): TitleFormData {
  if (!title) {
    return initialFormData;
  }

  return {
    tmdbId: toStringValue(title.tmdbId),
    type: title.type,
    name: title.name,
    originalName: title.originalName ?? "",
    overview: title.overview ?? "",
    posterPath: title.posterPath ?? "",
    backdropPath: title.backdropPath ?? "",
    releaseDate: title.releaseDate ?? "",
    runtimeMinutes: toStringValue(title.runtimeMinutes),
    originalLanguage: title.originalLanguage ?? "",
    country: title.country ?? "",
    tmdbVoteAverage: toStringValue(title.tmdbVoteAverage),
    tmdbVoteCount: toStringValue(title.tmdbVoteCount),
    genreIds: title.genres.map((genre) => genre.id),
    moodTagIds: title.moodTags.map((moodTag) => moodTag.id),
  };
}

function toTitleRequest(formData: TitleFormData): TitleRequest {
  return {
    tmdbId: toNullableNumber(formData.tmdbId),
    type: formData.type,
    name: formData.name,
    originalName: toNullableString(formData.originalName),
    overview: toNullableString(formData.overview),
    posterPath: toNullableString(formData.posterPath),
    backdropPath: toNullableString(formData.backdropPath),
    releaseDate: toNullableString(formData.releaseDate),
    runtimeMinutes: toNullableNumber(formData.runtimeMinutes),
    originalLanguage: toNullableString(formData.originalLanguage),
    country: toNullableString(formData.country),
    tmdbVoteAverage: toNullableNumber(formData.tmdbVoteAverage),
    tmdbVoteCount: toNullableNumber(formData.tmdbVoteCount),
    genreIds: formData.genreIds,
    moodTagIds: formData.moodTagIds,
  };
}

function toNullableString(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue === "" ? null : trimmedValue;
}

function toNullableNumber(value: string) {
  return value.trim() === "" ? null : Number(value);
}

function toStringValue(value: number | null) {
  return value === null ? "" : String(value);
}
