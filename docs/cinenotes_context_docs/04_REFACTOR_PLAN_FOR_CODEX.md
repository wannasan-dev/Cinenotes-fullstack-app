# Refactor Plan for Codex

## Important Instruction

Do not update the whole project in one step.

Follow this order:
1. Inspect existing project structure.
2. Refactor backend entities and enums only.
3. Add/update repositories only.
4. Add DTOs.
5. Add services.
6. Add controllers.
7. Update security rules.
8. Update frontend API client.
9. Update frontend pages/components.
10. Test and fix compile/runtime errors.

## Step 1: Inspect First

Before editing files, inspect the current backend.

Find:
- Existing entities
- Existing repositories
- Existing DTOs
- Existing controllers
- Existing services
- Existing security config
- Existing Title fields
- Existing user/admin model
- Where review/rating data is currently stored

Then summarize what should be kept, refactored, removed, or added.

## Step 2: Entity Refactor Only

Refactor or add only entities and enums.

Rules:
- Do not update controllers yet.
- Do not update services yet.
- Do not update frontend yet.
- Keep changes small enough to compile.
- Refactor old Title so it stores metadata only.
- Move user review/rating design into Review entity.
- Use AppUser with USER and ADMIN roles.

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

Required enums may include:
- UserRole
- TitleType
- WatchStatus
- WatchPlace
- WatchCompany
- AuditAction

## Step 3: Repository Layer

Add or update repositories for all required entities.

Useful methods:
- AppUser: findByUsername, findByEmail, existsByUsername, existsByEmail
- Title: findByTmdbIdAndType, existsByTmdbIdAndType
- Review: findByTitleId, findByUserId, findByUserIdAndTitleId
- WatchlistItem: findByUserId, findByUserIdAndTitleId
- WatchLog: findByUserId, findByUserIdAndTitleId
- MoodTag: findByName
- Genre: findByName, findByTmdbGenreId

## Step 4: DTO Layer

Add request and response DTOs after entities and repositories compile.

Suggested DTO groups:
- auth DTOs
- title DTOs
- review DTOs
- watchlist DTOs
- watch log DTOs
- mood tag DTOs
- admin DTOs

Do not expose passwordHash in responses.

## Step 5: Service Layer

Services should contain business logic.

Important service rules:
- Users can edit/delete only their own reviews.
- Users can manage only their own watchlist items.
- Users can manage only their own watch logs.
- Admins can manage titles, genres, mood tags, and review moderation.
- Review average should be calculated from Review records.
- Watchlist duplicate records should be prevented.
- WatchLog can have multiple entries for the same user/title.

## Step 6: Controller Layer

Suggested API groups:
- /api/auth
- /api/users/me
- /api/titles
- /api/reviews
- /api/watchlist
- /api/watch-logs
- /api/recommendations
- /api/admin/titles
- /api/admin/genres
- /api/admin/mood-tags
- /api/admin/reviews
- /api/admin/audit-logs

## Step 7: Security Update

Use JWT authentication.

Rules:
- Public can access GET /api/titles and title detail/reviews.
- USER and ADMIN can create reviews, watchlist items, and watch logs.
- ADMIN can access /api/admin/**.

## Step 8: Frontend Update

Do frontend after backend APIs are stable.

Update pages/components gradually:
- Login/Register
- Title list
- Title detail
- Review form/list
- Watchlist page
- Watch log page
- Mood recommendation page
- Admin title management
- Admin mood/genre management
- Admin review moderation

## Development Database Strategy

For this internship MVP, use a development database reset instead of complex migration.

Recommended:
- Backup old database if needed.
- Drop and recreate dev database.
- Let JPA create new tables or use migration scripts later.
- Seed admin user, basic genres, and mood tags.

Do not spend time migrating old Title review fields unless specifically required.
