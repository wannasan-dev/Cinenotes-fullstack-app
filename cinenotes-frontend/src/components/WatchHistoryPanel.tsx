import { useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "../api/apiClient";
import {
  deleteWatchLog,
  fetchCurrentUserWatchLogs,
  updateWatchLog,
} from "../api/watchLogApi";
import type {
  WatchLogResponse,
  WatchLogUpdateRequest,
} from "../types/watchLog";
import type { MoodTagResponse } from "../types/title";
import { getPosterSrc } from "../utils/poster";
import {
  getWatchCompanyLabel,
  getWatchPlaceLabel,
} from "../utils/watchLabels";
import {
  CalendarIcon,
  HomeIcon,
  RepeatIcon,
  UsersIcon,
} from "./UiIcons";
import {
  WatchMemoryEditor,
  type WatchMemoryFormData,
} from "./WatchMemoryEditor";

type WatchHistoryPanelProps = {
  authToken: string;
  refreshKey: number;
  availableMoods: MoodTagResponse[];
  moodsLoading: boolean;
  moodsError: string;
  onChanged: () => void;
  onDiscoverTitles: () => void;
};

export function WatchHistoryPanel({
  authToken,
  refreshKey,
  availableMoods,
  moodsLoading,
  moodsError,
  onChanged,
  onDiscoverTitles,
}: WatchHistoryPanelProps) {
  const [logs, setLogs] = useState<WatchLogResponse[]>([]);
  const [editingLog, setEditingLog] = useState<WatchLogResponse | null>(null);
  const [updatingLogId, setUpdatingLogId] = useState<number | null>(null);
  const [editError, setEditError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const editHeadingRef = useRef<HTMLHeadingElement>(null);
  const editButtonRefs = useRef(new Map<number, HTMLButtonElement>());

  const journalGroups = useMemo(() => groupJournalLogs(logs), [logs]);

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
    formData: WatchMemoryFormData
  ) {
    try {
      setUpdatingLogId(log.id);
      setEditError("");
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
      window.setTimeout(() => editButtonRefs.current.get(log.id)?.focus(), 0);
      onChanged();
    } catch (error) {
      setEditError(getWatchLogErrorMessage(error));
    } finally {
      setUpdatingLogId(null);
    }
  }

  function openEditForm(log: WatchLogResponse) {
    setEditingLog(log);
    setEditError("");
    window.setTimeout(() => editHeadingRef.current?.focus(), 0);
  }

  function closeEditForm() {
    const logId = editingLog?.id;
    setEditingLog(null);
    setEditError("");
    if (logId) window.setTimeout(() => editButtonRefs.current.get(logId)?.focus(), 0);
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
    <section className="journal-page" aria-labelledby="journal-heading">
      <header className="journal-page-header">
        <h1 id="journal-heading">My Journal</h1>
        <p>Your personal history with movies and series.</p>
      </header>

      {loading && <JournalLoadingState />}
      {error && <p className="form-error journal-error" role="alert">{error}</p>}

      {!loading && !error && logs.length === 0 ? (
        <div className="journal-page-empty">
          <h2>Your journal is empty.</h2>
          <p>Log a movie or series you&apos;ve watched to start building your viewing history.</p>
          <button type="button" onClick={onDiscoverTitles}>Discover titles</button>
        </div>
      ) : !loading && logs.length > 0 ? (
        <div className="journal-years">
          {journalGroups.map((yearGroup) => (
            <section className="journal-year" key={yearGroup.year} aria-labelledby={`journal-year-${yearGroup.year}`}>
              <h2 id={`journal-year-${yearGroup.year}`}>{yearGroup.year}</h2>
              {yearGroup.months.map((monthGroup) => (
                <section className="journal-month" key={`${yearGroup.year}-${monthGroup.month}`} aria-labelledby={`journal-month-${yearGroup.year}-${monthGroup.month}`}>
                  <h3 id={`journal-month-${yearGroup.year}-${monthGroup.month}`}>{monthGroup.month}</h3>
                  <div className="journal-entry-list">
                    {monthGroup.logs.map((log) => (
                      <article className="journal-entry" key={log.id}>
                        <time className="journal-entry-date" dateTime={log.watchedDate ?? undefined}>
                          {log.watchedDate ? (
                            <>
                              <span>{formatShortMonth(log.watchedDate)}</span>
                              <strong>{formatDay(log.watchedDate)}</strong>
                            </>
                          ) : (
                            <span>Date not set</span>
                          )}
                        </time>

                        <img className="journal-entry-poster" src={getPosterSrc(log.title.posterPath)} alt={`${log.title.name} poster`} />

                        <div className="journal-entry-content">
                          <div className="journal-entry-heading">
                            <h4>{log.title.name}</h4>
                            <div className="journal-entry-actions" aria-label={`Actions for ${log.title.name}`}>
                              <button
                                ref={(button) => {
                                  if (button) editButtonRefs.current.set(log.id, button);
                                  else editButtonRefs.current.delete(log.id);
                                }}
                                type="button"
                                onClick={() => openEditForm(log)}
                              >
                                Edit
                              </button>
                              <button className="journal-delete-action" type="button" onClick={() => handleDelete(log)}>Delete</button>
                            </div>
                          </div>

                          {log.memoryNote && (
                            <blockquote className="journal-memory-note">{log.memoryNote}</blockquote>
                          )}

                          <div className="journal-entry-context">
                            {log.watchedDate && <span><CalendarIcon size={16} />{formatFullDate(log.watchedDate)}</span>}
                            {log.watchPlace && <span><HomeIcon size={16} />{getWatchPlaceLabel(log.watchPlace)}</span>}
                            {log.watchCompany && <span><UsersIcon size={16} />With {getWatchCompanyLabel(log.watchCompany).toLowerCase()}</span>}
                            {log.rewatch && <span><RepeatIcon size={16} />Rewatch</span>}
                          </div>

                          {log.moods.length > 0 && (
                            <div className="journal-entry-moods" aria-label="Moods">
                              {log.moods.map((mood) => <span key={mood.id}>{mood.name}</span>)}
                            </div>
                          )}

                          {editingLog?.id === log.id && (
                            <WatchMemoryEditor
                              mode="edit"
                              initialLog={log}
                              availableMoods={availableMoods}
                              moodsLoading={moodsLoading}
                              moodsError={moodsError}
                              submitting={updatingLogId === log.id}
                              error={editError}
                              headingId={`journal-watch-editor-${log.id}`}
                              headingRef={editHeadingRef}
                              headingAs="h5"
                              onCancel={closeEditForm}
                              onSubmit={(formData) => handleUpdate(log, formData)}
                            />
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </section>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function JournalLoadingState() {
  return (
    <div className="journal-loading" role="status" aria-label="Loading your journal">
      <span className="journal-loading-year" />
      <span className="journal-loading-month" />
      <div className="journal-loading-entry" />
      <div className="journal-loading-entry" />
    </div>
  );
}

function toWatchLogUpdateRequest(
  formData: WatchMemoryFormData
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

type JournalMonthGroup = {
  month: string;
  logs: WatchLogResponse[];
};

type JournalYearGroup = {
  year: string;
  months: JournalMonthGroup[];
};

function groupJournalLogs(logs: WatchLogResponse[]): JournalYearGroup[] {
  const sortedLogs = [...logs].sort((first, second) => {
    if (first.watchedDate && second.watchedDate) {
      const dateOrder = second.watchedDate.localeCompare(first.watchedDate);
      return dateOrder !== 0 ? dateOrder : second.id - first.id;
    }
    if (first.watchedDate) return -1;
    if (second.watchedDate) return 1;
    return second.createdAt.localeCompare(first.createdAt);
  });
  const groups = new Map<string, Map<string, WatchLogResponse[]>>();

  for (const log of sortedLogs) {
    const year = log.watchedDate ? log.watchedDate.slice(0, 4) : "Undated";
    const month = log.watchedDate
      ? new Intl.DateTimeFormat(undefined, { month: "long" })
          .format(new Date(`${log.watchedDate}T00:00:00`))
          .toUpperCase()
      : "DATE NOT SET";
    const yearGroup = groups.get(year) ?? new Map<string, WatchLogResponse[]>();
    const monthLogs = yearGroup.get(month) ?? [];
    monthLogs.push(log);
    yearGroup.set(month, monthLogs);
    groups.set(year, yearGroup);
  }

  return Array.from(groups, ([year, months]) => ({
    year,
    months: Array.from(months, ([month, monthLogs]) => ({ month, logs: monthLogs })),
  }));
}

function formatShortMonth(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short" })
    .format(new Date(`${value}T00:00:00`));
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat(undefined, { day: "2-digit" })
    .format(new Date(`${value}T00:00:00`));
}

function formatFullDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" })
    .format(new Date(`${value}T00:00:00`));
}
