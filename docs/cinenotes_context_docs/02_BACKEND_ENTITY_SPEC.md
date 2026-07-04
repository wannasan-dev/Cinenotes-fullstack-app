# Backend Entity Specification

## General Rules

Use JPA annotations correctly.

Use `LocalDateTime` for:
- createdAt
- updatedAt
- deletedAt if needed later

Use `LocalDate` for:
- releaseDate
- watchedDate

Use enums for fixed values.

Do not use Lombok unless the existing project already uses Lombok.

Prefer clear entity names and table names.

## AppUser

Purpose:
Stores users and admins.

Suggested fields:
- id: Long
- username: String, unique, required
- email: String, unique, required
- passwordHash: String, required
- displayName: String
- bio: String
- profileImageUrl: String
- preferredLanguage: String
- role: UserRole, required
- isActive: Boolean
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

Enum:
- UserRole.USER
- UserRole.ADMIN

Relationships:
- OneToMany reviews
- OneToMany watchlistItems
- OneToMany watchLogs
- OneToMany auditLogs

## Title

Purpose:
Stores movie/series metadata only.

Suggested fields:
- id: Long
- tmdbId: Long
- type: TitleType
- name: String
- originalName: String
- overview: Text/String large column
- posterPath: String
- backdropPath: String
- releaseDate: LocalDate
- runtime: Integer
- originalLanguage: String
- tmdbVoteAverage: Double
- tmdbVoteCount: Integer
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

Enum:
- TitleType.MOVIE
- TitleType.SERIES

Unique constraint:
- tmdbId + type

Important:
Remove old user-specific review/rating fields from Title.

## Genre

Purpose:
Stores genre data.

Suggested fields:
- id: Long
- tmdbGenreId: Integer
- name: String, unique
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

Relationships:
- OneToMany titleGenres

## TitleGenre

Purpose:
Join entity between Title and Genre.

Suggested fields:
- id: Long
- title: ManyToOne Title
- genre: ManyToOne Genre
- createdAt: LocalDateTime

Unique constraint:
- title + genre

## MoodTag

Purpose:
Stores mood categories for recommendation and watch logs.

Suggested fields:
- id: Long
- name: String, unique
- description: String
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

Relationships:
- OneToMany titleMoodTags
- OneToMany watchLogMoods

## TitleMoodTag

Purpose:
Connects a title with mood tags used for recommendation.

Suggested fields:
- id: Long
- title: ManyToOne Title
- moodTag: ManyToOne MoodTag
- createdAt: LocalDateTime

Unique constraint:
- title + moodTag

## Review

Purpose:
Stores user reviews and ratings.

Suggested fields:
- id: Long
- user: ManyToOne AppUser
- title: ManyToOne Title
- rating: Integer or Double
- reviewText: Text/String large column
- language: String
- containsSpoiler: Boolean
- isVisible: Boolean
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

Unique constraint:
- user + title

Validation idea:
- rating should be within an allowed range, such as 1 to 10 or 1 to 5. Follow existing SRS/project decision.

## WatchlistItem

Purpose:
Stores a user's watchlist status for a title.

Suggested fields:
- id: Long
- user: ManyToOne AppUser
- title: ManyToOne Title
- status: WatchStatus
- isFavorite: Boolean
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

Enum:
- WatchStatus.WANT_TO_WATCH
- WatchStatus.WATCHING
- WatchStatus.WATCHED
- WatchStatus.DROPPED

Unique constraint:
- user + title

## WatchLog

Purpose:
Stores personal memory logs after watching.

Suggested fields:
- id: Long
- user: ManyToOne AppUser
- title: ManyToOne Title
- watchedDate: LocalDate
- watchPlace: WatchPlace
- watchCompany: WatchCompany
- isRewatch: Boolean
- memoryNote: Text/String large column
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

Enums:
- WatchPlace.HOME
- WatchPlace.CINEMA
- WatchPlace.STREAMING
- WatchPlace.SCHOOL
- WatchPlace.OTHER

- WatchCompany.ALONE
- WatchCompany.FRIENDS
- WatchCompany.FAMILY
- WatchCompany.PARTNER
- WatchCompany.OTHER

Important:
Do not add a unique constraint on user + title.
A user can watch the same title multiple times.

## WatchLogMood

Purpose:
Connects watch logs with mood tags.

Suggested fields:
- id: Long
- watchLog: ManyToOne WatchLog
- moodTag: ManyToOne MoodTag
- createdAt: LocalDateTime

Unique constraint:
- watchLog + moodTag

## AuditLog

Purpose:
Stores important activity records for admin accountability.

Suggested fields:
- id: Long
- actorUser: ManyToOne AppUser, nullable if system action
- action: AuditAction or String
- targetType: String
- targetId: Long
- description: String
- createdAt: LocalDateTime

Enum examples:
- LOGIN
- REGISTER
- TITLE_IMPORTED
- TITLE_CREATED
- TITLE_UPDATED
- TITLE_DELETED
- REVIEW_CREATED
- REVIEW_UPDATED
- REVIEW_DELETED
- REVIEW_MODERATED
- WATCHLIST_UPDATED
- WATCH_LOG_CREATED
- MOOD_TAG_CREATED
- USER_DEACTIVATED
