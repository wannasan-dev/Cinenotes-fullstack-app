# CineNotes Domain Model and Entity Relationships

## Source of Truth

The new ERD and SRS are the source of truth for the CineNotes MVP.

Codex should use this document to understand the target backend structure before editing entity classes.

## Core Entity List

Required entities:
- AppUser
- Title
- Genre
- TitleGenre
- MoodTag
- TitleMoodTag
- Review
- WatchlistItem
- WatchLog
- WatchLogMood
- AuditLog

## Relationship Summary

### AppUser

`AppUser` represents both normal users and admins.

Relationships:
- One AppUser has many Reviews.
- One AppUser has many WatchlistItems.
- One AppUser has many WatchLogs.
- One AppUser may perform many AuditLogs.

Roles:
- USER
- ADMIN

Do not create separate User and Admin tables for the MVP. Use one `AppUser` table with a role field.

---

### Title

`Title` represents movie/series metadata only.

Relationships:
- One Title has many Reviews.
- One Title has many WatchlistItems.
- One Title has many WatchLogs.
- One Title has many TitleGenres.
- One Title has many TitleMoodTags.

Important rule:
- Do not store user review text, user rating, or user-specific watch status in `Title`.

`Title` should describe the movie/series itself, not what a user thinks about it.

---

### Genre and TitleGenre

`Genre` stores genre data.

`TitleGenre` is a join entity between `Title` and `Genre`.

Relationships:
- One Title has many TitleGenres.
- One Genre has many TitleGenres.
- Each TitleGenre belongs to one Title and one Genre.

Unique rule:
- One title should not have the same genre twice.
- Enforce unique constraint on `(title_id, genre_id)`.

---

### MoodTag and TitleMoodTag

`MoodTag` stores mood categories used for recommendation.

Examples:
- Comforting
- Funny
- Emotional
- Relaxing
- Dark
- Mind-bending
- Romantic
- Inspiring

`TitleMoodTag` connects titles with mood tags.

Relationships:
- One Title has many TitleMoodTags.
- One MoodTag has many TitleMoodTags.
- Each TitleMoodTag belongs to one Title and one MoodTag.

Unique rule:
- One title should not have the same mood tag twice.
- Enforce unique constraint on `(title_id, mood_tag_id)`.

---

### Review

`Review` stores user-generated review content.

Relationships:
- Each Review belongs to one AppUser.
- Each Review belongs to one Title.
- One AppUser can write many Reviews.
- One Title can receive many Reviews.

Unique rule:
- One user can write only one main review for one title.
- Enforce unique constraint on `(user_id, title_id)`.

Important:
- Review/rating data must be moved out of `Title` and into `Review`.

---

### WatchlistItem

`WatchlistItem` stores a user's personal watch status for a title.

Relationships:
- Each WatchlistItem belongs to one AppUser.
- Each WatchlistItem belongs to one Title.
- One AppUser can have many WatchlistItems.
- One Title can be saved by many users.

Unique rule:
- One user should not have duplicate watchlist records for the same title.
- Enforce unique constraint on `(user_id, title_id)`.

Watch status examples:
- WANT_TO_WATCH
- WATCHING
- WATCHED
- DROPPED

---

### WatchLog

`WatchLog` stores personal watch memories.

Relationships:
- Each WatchLog belongs to one AppUser.
- Each WatchLog belongs to one Title.
- One AppUser can have many WatchLogs.
- One Title can appear in many WatchLogs.
- One WatchLog can have many WatchLogMood records.

Important:
- Do not enforce unique constraint on `(user_id, title_id)` for WatchLog.
- A user can watch the same title multiple times.

---

### WatchLogMood

`WatchLogMood` connects a WatchLog with MoodTags.

Relationships:
- Each WatchLogMood belongs to one WatchLog.
- Each WatchLogMood belongs to one MoodTag.

Unique rule:
- One watch log should not have the same mood tag twice.
- Enforce unique constraint on `(watch_log_id, mood_tag_id)`.

---

### AuditLog

`AuditLog` records important user/admin actions.

Relationships:
- Each AuditLog may belong to one actor AppUser.
- Actor can be null for system actions if needed.

Examples:
- LOGIN
- TITLE_IMPORTED
- TITLE_UPDATED
- REVIEW_CREATED
- REVIEW_DELETED
- REVIEW_MODERATED
- WATCHLIST_UPDATED
- WATCH_LOG_CREATED
- MOOD_TAG_CREATED
- USER_DEACTIVATED
