import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../api/apiClient";
import {
  deleteWatchLog,
  fetchCurrentUserWatchLogs,
  updateWatchLog,
} from "../api/watchLogApi";
import type {
  WatchCompany,
  WatchLogResponse,
  WatchLogUpdateRequest,
  WatchPlace,
} from "../types/watchLog";
import type { MoodTagResponse } from "../types/title";
import { getPosterSrc } from "../utils/poster";
import {
  getWatchCompanyLabel,
  getWatchPlaceLabel,
  WATCH_COMPANIES,
  WATCH_PLACES,
} from "../utils/watchLabels";

type WatchHistoryPanelProps = {
  authToken: string;
  refreshKey: number;
  onChanged: () => void;
};

type WatchLogFormData = {
  watchedDate: string;
  watchPlace: "" | WatchPlace;
  watchCompany: "" | WatchCompany;
  rewatch: boolean;
  memoryNote: string;
  moodTagIds: number[];
};

export function WatchHistoryPanel({
  authToken,
  refreshKey,
  onChanged,
}: WatchHistoryPanelProps) {
  const [logs, setLogs] = useState<WatchLogResponse[]>([]);
  const [editingLog, setEditingLog] = useState<WatchLogResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWatchLogs() {
      try {
        setLoading(true);
        setError("");
        setLogs(await fetchCurrentUserWatchLogs(authToken));
      } catch (error) {
        setError(getWatchLogErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadWatchLogs();
  }, [authToken, refreshKey]);

  async function handleUpdate(
    log: WatchLogResponse,
    formData: WatchLogFormData
  ) {
    try {
      setError("");
      const updatedLog = await updateWatchLog(
        log.id,
        toWatchLogUpdateRequest(formData),
        authToken
      );

      setLogs((currentLogs) =>
        currentLogs.map((currentLog) =>
          currentLog.id === updatedLog.id ? updatedLog : currentLog
        )
      );
      setEditingLog(null);
      onChanged();
    } catch (error) {
      setError(getWatchLogErrorMessage(error));
    }
  }

  async function handleDelete(log: WatchLogResponse) {
    const shouldDelete = window.confirm("Delete this watch log?");
    if (!shouldDelete) return;

    try {
      setError("");
      await deleteWatchLog(log.id, authToken);
      setLogs((currentLogs) =>
        currentLogs.filter((currentLog) => currentLog.id !== log.id)
      );
      setEditingLog(null);
      onChanged();
    } catch (error) {
      setError(getWatchLogErrorMessage(error));
    }
  }

  return (
    <section className="watch-panel">
      <div className="watch-panel-header">
        <div>
          <p className="eyebrow">Watch history</p>
          <h2>Your watching memory</h2>
        </div>
      </div>

      {loading && <p className="watch-empty">Loading watch history...</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && logs.length === 0 ? (
        <p className="watch-empty">No watch logs yet.</p>
      ) : (
        <div className="watch-log-list">
          {logs.map((log) => (
            <article key={log.id} className="watch-log-item">
              <img src={getPosterSrc(log.title.posterPath)} alt={log.title.name} />
              <div>
                <div className="watch-log-header">
                  <div>
                    <h3>{log.title.name}</h3>
                    <p>
                      {log.watchedDate || "Date not set"} |{" "}
                      {log.watchPlace
                        ? getWatchPlaceLabel(log.watchPlace)
                        : "Place not set"}{" "}
                      |{" "}
                      {log.watchCompany
                        ? getWatchCompanyLabel(log.watchCompany)
                        : "Company not set"}
                    </p>
                  </div>

                  <div className="watch-log-actions">
                    <button onClick={() => setEditingLog(log)}>Edit</button>
                    <button onClick={() => handleDelete(log)}>Delete</button>
                  </div>
                </div>

                {log.rewatch && <p className="watch-badge">Rewatch</p>}
                {log.memoryNote && <p className="review-text">{log.memoryNote}</p>}
                {log.moods.length > 0 && (
                  <p className="mood-tags">
                    {log.moods.map((mood) => mood.name).join(" / ")}
                  </p>
                )}

                {editingLog?.id === log.id && (
                  <WatchLogEditForm
                    log={log}
                    onCancel={() => setEditingLog(null)}
                    onSubmit={(formData) => handleUpdate(log, formData)}
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function WatchLogEditForm({
  log,
  onCancel,
  onSubmit,
}: {
  log: WatchLogResponse;
  onCancel: () => void;
  onSubmit: (formData: WatchLogFormData) => void;
}) {
  const [formData, setFormData] = useState<WatchLogFormData>(() => ({
    watchedDate: log.watchedDate ?? "",
    watchPlace: log.watchPlace ?? "",
    watchCompany: log.watchCompany ?? "",
    rewatch: Boolean(log.rewatch),
    memoryNote: log.memoryNote ?? "",
    moodTagIds: log.moods.map((mood) => mood.id),
  }));

  function updateField<Key extends keyof WatchLogFormData>(
    key: Key,
    value: WatchLogFormData[Key]
  ) {
    setFormData((currentData) => ({
      ...currentData,
      [key]: value,
    }));
  }

  function toggleMood(mood: MoodTagResponse) {
    setFormData((currentData) => ({
      ...currentData,
      moodTagIds: currentData.moodTagIds.includes(mood.id)
        ? currentData.moodTagIds.filter((id) => id !== mood.id)
        : [...currentData.moodTagIds, mood.id],
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(formData);
  }

  return (
    <form className="watch-log-form" onSubmit={handleSubmit}>
      <label>
        Watched date
        <input
          type="date"
          value={formData.watchedDate}
          onChange={(event) => updateField("watchedDate", event.target.value)}
        />
      </label>

      <label>
        Place
        <select
          value={formData.watchPlace}
          onChange={(event) =>
            updateField("watchPlace", event.target.value as "" | WatchPlace)
          }
        >
          <option value="">Preserve empty</option>
          {WATCH_PLACES.map((place) => (
            <option key={place} value={place}>
              {getWatchPlaceLabel(place)}
            </option>
          ))}
        </select>
      </label>

      <label>
        Company
        <select
          value={formData.watchCompany}
          onChange={(event) =>
            updateField("watchCompany", event.target.value as "" | WatchCompany)
          }
        >
          <option value="">Preserve empty</option>
          {WATCH_COMPANIES.map((company) => (
            <option key={company} value={company}>
              {getWatchCompanyLabel(company)}
            </option>
          ))}
        </select>
      </label>

      <label className="inline-checkbox">
        <input
          type="checkbox"
          checked={formData.rewatch}
          onChange={(event) => updateField("rewatch", event.target.checked)}
        />
        Rewatch
      </label>

      <label className="watch-log-form-full">
        Memory note
        <textarea
          value={formData.memoryNote}
          onChange={(event) => updateField("memoryNote", event.target.value)}
          maxLength={5000}
        />
      </label>

      {log.moods.length > 0 && (
        <fieldset className="watch-log-form-full option-fieldset">
          <legend>Moods</legend>
          {log.moods.map((mood) => (
            <label key={mood.id} className="checkbox-option">
              <input
                type="checkbox"
                checked={formData.moodTagIds.includes(mood.id)}
                onChange={() => toggleMood(mood)}
              />
              {mood.name}
            </label>
          ))}
        </fieldset>
      )}

      <div className="watch-log-form-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit">Save log</button>
      </div>
    </form>
  );
}

function toWatchLogUpdateRequest(
  formData: WatchLogFormData
): WatchLogUpdateRequest {
  return {
    watchedDate: formData.watchedDate === "" ? null : formData.watchedDate,
    watchPlace: formData.watchPlace === "" ? null : formData.watchPlace,
    watchCompany:
      formData.watchCompany === "" ? null : formData.watchCompany,
    rewatch: formData.rewatch,
    memoryNote: formData.memoryNote,
    moodTagIds: formData.moodTagIds,
  };
}

function getWatchLogErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Could not update watch history right now.";
}
