# Useful Codex Prompts for CineNotes Refactor

## Prompt 1: Project Inspection

Use this first.

```text
Read the documentation in /docs/codex-context before editing files. Then inspect the current Spring Boot backend and summarize the existing entities, repositories, services, controllers, DTOs, and security configuration. Do not change any files yet. Explain what should be kept, refactored, removed, or added to match the new CineNotes MVP architecture.
```

## Prompt 2: Entity Refactor Only

```text
Using /docs/codex-context as the source of truth, refactor only the backend entity and enum layer for the new CineNotes MVP. Do not update services, controllers, security, or frontend yet.

Requirements:
1. Refactor Title so it stores only movie/series metadata, not user review/rating data.
2. Use AppUser as the main user/admin entity with role USER or ADMIN.
3. Add or update these entities: AppUser, Title, Genre, TitleGenre, MoodTag, TitleMoodTag, Review, WatchlistItem, WatchLog, WatchLogMood, and AuditLog.
4. Add necessary enums such as UserRole, TitleType, WatchStatus, WatchPlace, WatchCompany, and AuditAction if appropriate.
5. Add JPA relationships and unique constraints described in the docs.
6. Use LocalDateTime for createdAt/updatedAt and LocalDate for releaseDate/watchedDate.
7. Do not use Lombok unless the project already uses it.
8. Keep the backend compiling.
```

## Prompt 3: Repository Layer

```text
Now add or update Spring Data JPA repositories for the new CineNotes MVP entities only. Do not update services, controllers, security, or frontend yet. Add useful query methods for AppUser, Title, Review, WatchlistItem, WatchLog, Genre, and MoodTag based on /docs/codex-context.
```

## Prompt 4: DTO Layer

```text
Add request and response DTOs for the new CineNotes MVP backend. Follow /docs/codex-context. Do not expose passwordHash. Keep DTOs simple and aligned with the current frontend needs. Do not update frontend yet.
```

## Prompt 5: Service Layer

```text
Implement service classes for title browsing, reviews, watchlist, watch logs, mood tags, and recommendations. Follow the business rules in /docs/codex-context. Users can only manage their own reviews/watchlist/watch logs. Admins can manage titles, genres, mood tags, and review moderation. Keep code simple for MVP.
```

## Prompt 6: Controller Layer

```text
Add REST controllers for the CineNotes MVP APIs according to /docs/codex-context. Use clean endpoint naming. Keep public title browsing available without login. Protect user-specific endpoints with authentication and admin endpoints with ADMIN role.
```

## Prompt 7: Frontend Planning Before Coding

```text
Inspect the current React TypeScript Vite frontend. Do not edit files yet. Based on /docs/codex-context, summarize which pages/components can be reused, which must be refactored, and which new pages/components are needed for the CineNotes MVP.
```

## Prompt 8: Frontend API Client

```text
Update the frontend API client layer to match the new backend APIs for auth, titles, reviews, watchlist, watch logs, mood tags, and recommendations. Do not redesign UI yet. Keep changes small and compile-safe.
```
