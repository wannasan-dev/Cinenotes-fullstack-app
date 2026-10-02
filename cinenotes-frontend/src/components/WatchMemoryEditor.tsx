import { useState, type FormEvent, type Ref } from "react";
import type { MoodTagResponse } from "../types/title";
import type {
  WatchCompany,
  WatchLogResponse,
  WatchPlace,
} from "../types/watchLog";
import {
  getWatchCompanyLabel,
  getWatchPlaceLabel,
  WATCH_COMPANIES,
  WATCH_PLACES,
} from "../utils/watchLabels";

export type WatchMemoryFormData = {
  watchedDate: string;
  watchPlace: "" | WatchPlace;
  watchCompany: "" | WatchCompany;
  rewatch: boolean;
  memoryNote: string;
  moodTagIds: number[];
};

type WatchMemoryEditorProps = {
  mode: "create" | "edit";
  availableMoods: MoodTagResponse[];
  moodsLoading: boolean;
  moodsError: string;
  initialLog?: WatchLogResponse;
  submitting: boolean;
  error?: string;
  headingId: string;
  headingRef?: Ref<HTMLHeadingElement>;
  headingAs?: "h3" | "h5";
  onCancel: () => void;
  onSubmit: (formData: WatchMemoryFormData) => void | Promise<void>;
};

export function WatchMemoryEditor({
  mode,
  availableMoods,
  moodsLoading,
  moodsError,
  initialLog,
  submitting,
  error = "",
  headingId,
  headingRef,
  headingAs: Heading = "h3",
  onCancel,
  onSubmit,
}: WatchMemoryEditorProps) {
  const [formData, setFormData] = useState<WatchMemoryFormData>(() => ({
    watchedDate: initialLog?.watchedDate ?? (mode === "create" ? getToday() : ""),
    watchPlace: initialLog?.watchPlace ?? "",
    watchCompany: initialLog?.watchCompany ?? "",
    rewatch: Boolean(initialLog?.rewatch),
    memoryNote: initialLog?.memoryNote ?? "",
    moodTagIds: initialLog?.moods.map((mood) => mood.id) ?? [],
  }));

  function updateField<Key extends keyof WatchMemoryFormData>(
    key: Key,
    value: WatchMemoryFormData[Key]
  ) {
    setFormData((currentData) => ({ ...currentData, [key]: value }));
  }

  function toggleMood(moodId: number) {
    setFormData((currentData) => ({
      ...currentData,
      moodTagIds: currentData.moodTagIds.includes(moodId)
        ? currentData.moodTagIds.filter((id) => id !== moodId)
        : [...currentData.moodTagIds, moodId],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    await onSubmit(formData);
  }

  const noteGuidanceId = `${headingId}-note-guidance`;

  return (
    <div className="watch-memory-editor">
      <header className="watch-memory-editor-intro">
        <Heading ref={headingRef} id={headingId} tabIndex={-1}>
          {mode === "create" ? "Log this watch" : "Edit watch memory"}
        </Heading>
        <p>
          {mode === "create"
            ? "Capture when you watched it, where you were, who you were with, and how it felt."
            : "Update the details you want to remember about this viewing."}
        </p>
      </header>

      <form className="watch-log-form watch-memory-form" onSubmit={handleSubmit} aria-busy={submitting}>
        <div className="watch-memory-metadata-grid">
          <label>
            When did you watch it?
            <input
              type="date"
              value={formData.watchedDate}
              disabled={submitting}
              onChange={(event) => updateField("watchedDate", event.target.value)}
            />
          </label>

          <label>
            Where did you watch?
            <select
              value={formData.watchPlace}
              disabled={submitting}
              onChange={(event) =>
                updateField("watchPlace", event.target.value as "" | WatchPlace)
              }
            >
              <option value="">Not set</option>
              {WATCH_PLACES.map((place) => (
                <option key={place} value={place}>{getWatchPlaceLabel(place)}</option>
              ))}
            </select>
          </label>

          <label>
            Who were you with?
            <select
              value={formData.watchCompany}
              disabled={submitting}
              onChange={(event) =>
                updateField("watchCompany", event.target.value as "" | WatchCompany)
              }
            >
              <option value="">Not set</option>
              {WATCH_COMPANIES.map((company) => (
                <option key={company} value={company}>{getWatchCompanyLabel(company)}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="watch-memory-rewatch-option">
          <input
            type="checkbox"
            checked={formData.rewatch}
            disabled={submitting}
            onChange={(event) => updateField("rewatch", event.target.checked)}
          />
          <span>Was this a rewatch?</span>
        </label>

        <label className="watch-memory-note-field">
          <span>What do you want to remember about this viewing?</span>
          <small id={noteGuidanceId}>A moment, thought, conversation, or feeling you want to keep.</small>
          <textarea
            value={formData.memoryNote}
            disabled={submitting}
            aria-describedby={noteGuidanceId}
            onChange={(event) => updateField("memoryNote", event.target.value)}
            maxLength={5000}
          />
        </label>

        <fieldset className="watch-memory-feelings">
          <legend>How did this make you feel?</legend>
          {moodsLoading ? (
            <p className="watch-memory-moods-status" role="status">Loading feelings…</p>
          ) : moodsError ? (
            <p className="watch-memory-moods-status error" role="alert">{moodsError}</p>
          ) : availableMoods.length > 0 ? (
            <div className="watch-memory-mood-options">
              {availableMoods.map((mood) => {
                const selected = formData.moodTagIds.includes(mood.id);
                return (
                  <label key={mood.id} className={selected ? "selected" : ""}>
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={submitting}
                      onChange={() => toggleMood(mood.id)}
                    />
                    <span>{mood.name}</span>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="watch-memory-moods-status">No feelings are available yet.</p>
          )}
        </fieldset>

        {error && <p className="form-error watch-memory-form-error" role="alert">{error}</p>}

        <div className="watch-log-form-actions">
          <button type="button" onClick={onCancel} disabled={submitting}>Cancel</button>
          <button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : mode === "create" ? "Save memory" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}
