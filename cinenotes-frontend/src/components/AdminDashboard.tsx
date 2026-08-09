import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../api/apiClient";
import { deleteTitle } from "../api/titleApi";
import {
  createAdminGenre,
  deleteAdminGenre,
  fetchAdminGenres,
  updateAdminGenre,
} from "../api/adminGenreApi";
import {
  createAdminMoodTag,
  deleteAdminMoodTag,
  fetchAdminMoodTags,
  updateAdminMoodTag,
} from "../api/adminMoodTagApi";
import {
  activateAdminUser,
  deactivateAdminUser,
  fetchAdminUsers,
  updateAdminUserRole,
} from "../api/adminUserApi";
import {
  fetchAdminReviews,
  hideAdminReview,
  restoreAdminReview,
} from "../api/adminReviewApi";
import { fetchAuditLogs, fetchAuditLogsByActor } from "../api/auditLogApi";
import { TitleForm } from "./TitleForm";
import type {
  AuditLogResponse,
  GenreRequest,
  MoodTagRequest,
  UserAdminResponse,
} from "../types/admin";
import type { UserRole } from "../types/auth";
import type { ReviewResponse } from "../types/review";
import type { GenreResponse, MoodTagResponse, Title } from "../types/title";

type AdminTab =
  | "titles"
  | "genres"
  | "mood-tags"
  | "users"
  | "reviews"
  | "audit";

type AdminDashboardProps = {
  authToken: string;
  titles: Title[];
  onTitleCreated: (title: Title) => void;
  onTitleUpdated: (title: Title) => void;
  onTitleDeleted: (titleId: number) => void;
};

const adminTabs: { id: AdminTab; label: string }[] = [
  { id: "titles", label: "Titles" },
  { id: "genres", label: "Genres" },
  { id: "mood-tags", label: "Mood Tags" },
  { id: "users", label: "Users" },
  { id: "reviews", label: "Review Moderation" },
  { id: "audit", label: "Audit Logs" },
];

export function AdminDashboard({
  authToken,
  titles,
  onTitleCreated,
  onTitleUpdated,
  onTitleDeleted,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("titles");

  return (
    <section className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <p className="eyebrow">Admin tools</p>
          <h2>CineNotes Admin</h2>
        </div>
      </div>

      <div className="admin-tabs">
        {adminTabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "titles" && (
        <AdminTitlePanel
          authToken={authToken}
          titles={titles}
          onTitleCreated={onTitleCreated}
          onTitleUpdated={onTitleUpdated}
          onTitleDeleted={onTitleDeleted}
        />
      )}
      {activeTab === "genres" && <AdminGenrePanel authToken={authToken} />}
      {activeTab === "mood-tags" && <AdminMoodTagPanel authToken={authToken} />}
      {activeTab === "users" && <AdminUsersPanel authToken={authToken} />}
      {activeTab === "reviews" && (
        <AdminReviewModerationPanel authToken={authToken} />
      )}
      {activeTab === "audit" && <AdminAuditLogPanel authToken={authToken} />}
    </section>
  );
}

function AdminTitlePanel({
  authToken,
  titles,
  onTitleCreated,
  onTitleUpdated,
  onTitleDeleted,
}: AdminDashboardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState<Title | null>(null);
  const [error, setError] = useState("");

  async function handleDeleteTitle(title: Title) {
    const shouldDelete = window.confirm(`Delete "${title.name}" from CineNotes?`);
    if (!shouldDelete) return;

    try {
      setError("");
      await deleteTitle(title.id, authToken);
      onTitleDeleted(title.id);
    } catch (error) {
      setError(getAdminErrorMessage(error));
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h3>Titles</h3>
          <p>{titles.length} titles in the current browse result.</p>
        </div>

        {!isFormOpen && (
          <button
            className="admin-add-button"
            onClick={() => {
              setEditingTitle(null);
              setIsFormOpen(true);
            }}
          >
            Add title
          </button>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      {isFormOpen && (
        <TitleForm
          key={editingTitle ? `admin-edit-${editingTitle.id}` : "admin-create-title"}
          editingTitle={editingTitle}
          authToken={authToken}
          onCancelEdit={() => {
            setEditingTitle(null);
            setIsFormOpen(false);
          }}
          onTitleCreated={(title) => {
            onTitleCreated(title);
            setIsFormOpen(false);
          }}
          onTitleUpdated={(title) => {
            onTitleUpdated(title);
            setEditingTitle(null);
            setIsFormOpen(false);
          }}
        />
      )}

      <div className="admin-table">
        {titles.map((title) => (
          <div key={title.id} className="admin-table-row">
            <div>
              <strong>{title.name}</strong>
              <p>
                {title.type} | TMDb {title.tmdbId ?? "not set"} |{" "}
                {title.releaseDate ?? "date TBA"}
              </p>
            </div>
            <div className="admin-row-actions">
              <button
                onClick={() => {
                  setEditingTitle(title);
                  setIsFormOpen(true);
                }}
              >
                Edit
              </button>
              <button onClick={() => handleDeleteTitle(title)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminGenrePanel({ authToken }: { authToken: string }) {
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  const [editingGenre, setEditingGenre] = useState<GenreResponse | null>(null);
  const [formData, setFormData] = useState({ tmdbGenreId: "", name: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadInitialGenres() {
      try {
        const genreList = await fetchAdminGenres(authToken);
        if (!ignore) {
          setGenres(genreList);
          setError("");
        }
      } catch (error) {
        if (!ignore) {
          setError(getAdminErrorMessage(error));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialGenres();
    return () => {
      ignore = true;
    };
  }, [authToken]);

  async function refreshGenres() {
    setGenres(await fetchAdminGenres(authToken));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setError("");
      setMessage("");
      const request: GenreRequest = {
        tmdbGenreId:
          formData.tmdbGenreId.trim() === "" ? null : Number(formData.tmdbGenreId),
        name: formData.name.trim(),
      };

      if (editingGenre) {
        await updateAdminGenre(editingGenre.id, request, authToken);
        setMessage("Genre updated.");
      } else {
        await createAdminGenre(request, authToken);
        setMessage("Genre created.");
      }

      setEditingGenre(null);
      setFormData({ tmdbGenreId: "", name: "" });
      await refreshGenres();
    } catch (error) {
      setError(getAdminErrorMessage(error));
    }
  }

  async function handleDelete(genre: GenreResponse) {
    const shouldDelete = window.confirm(`Delete genre "${genre.name}"?`);
    if (!shouldDelete) return;

    try {
      setError("");
      await deleteAdminGenre(genre.id, authToken);
      setMessage("Genre deleted.");
      await refreshGenres();
    } catch (error) {
      setError(getAdminErrorMessage(error));
    }
  }

  return (
    <AdminResourceSection title="Genres" loading={loading}>
      <form className="admin-inline-form" onSubmit={handleSubmit}>
        <input
          placeholder="TMDb genre ID"
          type="number"
          value={formData.tmdbGenreId}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              tmdbGenreId: event.target.value,
            }))
          }
        />
        <input
          placeholder="Genre name"
          value={formData.name}
          onChange={(event) =>
            setFormData((current) => ({ ...current, name: event.target.value }))
          }
          required
        />
        <button type="submit">{editingGenre ? "Update" : "Create"}</button>
        {editingGenre && (
          <button
            type="button"
            onClick={() => {
              setEditingGenre(null);
              setFormData({ tmdbGenreId: "", name: "" });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}

      <div className="admin-table">
        {genres.map((genre) => (
          <div key={genre.id} className="admin-table-row">
            <div>
              <strong>{genre.name}</strong>
              <p>TMDb ID: {genre.tmdbGenreId ?? "not set"}</p>
            </div>
            <div className="admin-row-actions">
              <button
                onClick={() => {
                  setEditingGenre(genre);
                  setFormData({
                    tmdbGenreId: genre.tmdbGenreId?.toString() ?? "",
                    name: genre.name,
                  });
                }}
              >
                Edit
              </button>
              <button onClick={() => handleDelete(genre)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </AdminResourceSection>
  );
}

function AdminMoodTagPanel({ authToken }: { authToken: string }) {
  const [moodTags, setMoodTags] = useState<MoodTagResponse[]>([]);
  const [editingMoodTag, setEditingMoodTag] = useState<MoodTagResponse | null>(
    null
  );
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadInitialMoodTags() {
      try {
        const moodTagList = await fetchAdminMoodTags(authToken);
        if (!ignore) {
          setMoodTags(moodTagList);
          setError("");
        }
      } catch (error) {
        if (!ignore) {
          setError(getAdminErrorMessage(error));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialMoodTags();
    return () => {
      ignore = true;
    };
  }, [authToken]);

  async function refreshMoodTags() {
    setMoodTags(await fetchAdminMoodTags(authToken));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setError("");
      setMessage("");
      const request: MoodTagRequest = {
        name: formData.name.trim(),
        description:
          formData.description.trim() === "" ? null : formData.description,
      };

      if (editingMoodTag) {
        await updateAdminMoodTag(editingMoodTag.id, request, authToken);
        setMessage("Mood tag updated.");
      } else {
        await createAdminMoodTag(request, authToken);
        setMessage("Mood tag created.");
      }

      setEditingMoodTag(null);
      setFormData({ name: "", description: "" });
      await refreshMoodTags();
    } catch (error) {
      setError(getAdminErrorMessage(error));
    }
  }

  async function handleDelete(moodTag: MoodTagResponse) {
    const shouldDelete = window.confirm(`Delete mood tag "${moodTag.name}"?`);
    if (!shouldDelete) return;

    try {
      setError("");
      await deleteAdminMoodTag(moodTag.id, authToken);
      setMessage("Mood tag deleted.");
      await refreshMoodTags();
    } catch (error) {
      setError(getAdminErrorMessage(error));
    }
  }

  return (
    <AdminResourceSection title="Mood Tags" loading={loading}>
      <form className="admin-inline-form" onSubmit={handleSubmit}>
        <input
          placeholder="Mood tag name"
          value={formData.name}
          onChange={(event) =>
            setFormData((current) => ({ ...current, name: event.target.value }))
          }
          required
        />
        <input
          placeholder="Description"
          value={formData.description}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
        />
        <button type="submit">{editingMoodTag ? "Update" : "Create"}</button>
        {editingMoodTag && (
          <button
            type="button"
            onClick={() => {
              setEditingMoodTag(null);
              setFormData({ name: "", description: "" });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}

      <div className="admin-table">
        {moodTags.map((moodTag) => (
          <div key={moodTag.id} className="admin-table-row">
            <div>
              <strong>{moodTag.name}</strong>
              <p>{moodTag.description || "No description"}</p>
            </div>
            <div className="admin-row-actions">
              <button
                onClick={() => {
                  setEditingMoodTag(moodTag);
                  setFormData({
                    name: moodTag.name,
                    description: moodTag.description ?? "",
                  });
                }}
              >
                Edit
              </button>
              <button onClick={() => handleDelete(moodTag)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </AdminResourceSection>
  );
}

function AdminUsersPanel({ authToken }: { authToken: string }) {
  const [users, setUsers] = useState<UserAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadInitialUsers() {
      try {
        const userList = await fetchAdminUsers(authToken);
        if (!ignore) {
          setUsers(userList);
          setError("");
        }
      } catch (error) {
        if (!ignore) {
          setError(getAdminErrorMessage(error));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialUsers();
    return () => {
      ignore = true;
    };
  }, [authToken]);

  async function replaceUser(action: () => Promise<UserAdminResponse>, message: string) {
    try {
      setError("");
      setMessage("");
      const updatedUser = await action();
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        )
      );
      setMessage(message);
    } catch (error) {
      setError(getAdminErrorMessage(error));
    }
  }

  return (
    <AdminResourceSection title="Users" loading={loading}>
      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}

      <div className="admin-table">
        {users.map((user) => (
          <div key={user.id} className="admin-table-row">
            <div>
              <strong>{user.displayName || user.username}</strong>
              <p>
                @{user.username} | {user.email} |{" "}
                {user.active ? "Active" : "Inactive"} | Joined{" "}
                {formatDate(user.createdAt)}
              </p>
            </div>
            <div className="admin-row-actions">
              <select
                value={user.role}
                onChange={(event) =>
                  replaceUser(
                    () =>
                      updateAdminUserRole(
                        user.id,
                        { role: event.target.value as UserRole },
                        authToken
                      ),
                    "User role updated."
                  )
                }
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              {user.active ? (
                <button
                  onClick={() =>
                    replaceUser(
                      () => deactivateAdminUser(user.id, authToken),
                      "User deactivated."
                    )
                  }
                >
                  Deactivate
                </button>
              ) : (
                <button
                  onClick={() =>
                    replaceUser(
                      () => activateAdminUser(user.id, authToken),
                      "User activated."
                    )
                  }
                >
                  Activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminResourceSection>
  );
}

function AdminReviewModerationPanel({ authToken }: { authToken: string }) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [visibilityFilter, setVisibilityFilter] = useState<
    "ALL" | "VISIBLE" | "HIDDEN"
  >("ALL");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadInitialReviews() {
      try {
        const reviewList = await fetchAdminReviews(undefined, authToken);
        if (!ignore) {
          setReviews(reviewList);
          setError("");
        }
      } catch (error) {
        if (!ignore) {
          setError(getAdminErrorMessage(error));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialReviews();
    return () => {
      ignore = true;
    };
  }, [authToken]);

  async function loadReviews(filter = visibilityFilter) {
    try {
      const visible =
        filter === "ALL" ? undefined : filter === "VISIBLE";
      setReviews(await fetchAdminReviews(visible, authToken));
      setError("");
    } catch (error) {
      setError(getAdminErrorMessage(error));
    }
  }

  async function moderate(review: ReviewResponse) {
    try {
      setError("");
      setMessage("");
      if (review.visible === false) {
        await restoreAdminReview(review.id, authToken);
        setMessage("Review restored.");
      } else {
        await hideAdminReview(review.id, authToken);
        setMessage("Review hidden.");
      }

      await loadReviews();
    } catch (error) {
      setError(getAdminErrorMessage(error));
    }
  }

  return (
    <AdminResourceSection title="Review Moderation" loading={loading}>
      <div className="admin-inline-form">
        <select
          value={visibilityFilter}
          onChange={(event) => {
            const nextFilter = event.target.value as
              | "ALL"
              | "VISIBLE"
              | "HIDDEN";
            setVisibilityFilter(nextFilter);
            loadReviews(nextFilter);
          }}
        >
          <option value="ALL">All reviews</option>
          <option value="VISIBLE">Visible only</option>
          <option value="HIDDEN">Hidden only</option>
        </select>

        <button onClick={() => loadReviews()}>Refresh</button>
      </div>

      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}

      {reviews.length === 0 ? (
        <p className="admin-note">No reviews match this filter.</p>
      ) : (
        <div className="admin-table">
          {reviews.map((review) => (
            <div key={review.id} className="admin-table-row">
              <div>
                <strong>
                  Review #{review.id} | {review.titleName}
                </strong>
                <p>
                  By {review.user.displayName || review.user.username} | Rating{" "}
                  {review.rating.toFixed(1)}/10 |{" "}
                  {review.visible === false ? "Hidden" : "Visible"}
                  {review.containsSpoiler ? " | Spoiler" : ""}
                </p>
                <p>
                  {review.reviewText
                    ? getReviewPreview(review.reviewText)
                    : "No written review."}
                </p>
                <p>Created {formatDate(review.createdAt)}</p>
              </div>
              <div className="admin-row-actions">
                <button onClick={() => moderate(review)}>
                  {review.visible === false ? "Restore" : "Hide"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminResourceSection>
  );
}

function AdminAuditLogPanel({ authToken }: { authToken: string }) {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [actorUserId, setActorUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadInitialLogs() {
      try {
        const auditLogs = await fetchAuditLogs(authToken);
        if (!ignore) {
          setLogs(auditLogs);
          setError("");
        }
      } catch (error) {
        if (!ignore) {
          setError(getAdminErrorMessage(error));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialLogs();
    return () => {
      ignore = true;
    };
  }, [authToken]);

  async function loadLogs(nextActorUserId = "") {
    try {
      const parsedActorId = Number(nextActorUserId);
      const auditLogs =
        nextActorUserId.trim() === ""
          ? await fetchAuditLogs(authToken)
          : await fetchAuditLogsByActor(parsedActorId, authToken);

      setLogs(auditLogs);
      setError("");
    } catch (error) {
      setError(getAdminErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminResourceSection title="Audit Logs" loading={loading}>
      <div className="admin-inline-form">
        <input
          type="number"
          placeholder="Actor user ID"
          value={actorUserId}
          onChange={(event) => setActorUserId(event.target.value)}
        />
        <button onClick={() => loadLogs(actorUserId)}>Filter</button>
        <button
          onClick={() => {
            setActorUserId("");
            loadLogs("");
          }}
        >
          Clear
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="admin-table">
        {logs.map((log) => (
          <div key={log.id} className="admin-table-row">
            <div>
              <strong>{log.action}</strong>
              <p>
                {formatDate(log.createdAt)} | Actor{" "}
                {log.actor
                  ? log.actor.displayName || log.actor.username
                  : "unknown"}{" "}
                | {log.targetType} #{log.targetId ?? "none"}
              </p>
              <p>{log.description || "No description"}</p>
            </div>
          </div>
        ))}
      </div>
    </AdminResourceSection>
  );
}

function AdminResourceSection({
  title,
  loading = false,
  children,
}: {
  title: string;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h3>{title}</h3>
          {loading && <p>Loading...</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function getAdminErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Admin action failed. Please try again.";
}

function getReviewPreview(reviewText: string) {
  return reviewText.length > 180
    ? `${reviewText.slice(0, 180).trim()}...`
    : reviewText;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
