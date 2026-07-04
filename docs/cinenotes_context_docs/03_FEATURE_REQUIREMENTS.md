# CineNotes MVP Feature Requirements

## Authentication and Authorization

Users should be able to:
- Register
- Log in
- Receive JWT token
- Access their profile
- Update their profile later if included in MVP

Roles:
- USER
- ADMIN

Access rules:
- Public visitors can browse titles and reviews.
- USER can manage their own reviews, watchlist, and watch logs.
- ADMIN can manage title data, genres, mood tags, and moderation.

## Title Browsing

Public users should be able to:
- Browse titles
- Search titles
- Filter by type
- Filter by genre
- Filter by mood tag
- Sort titles
- View title details
- View public visible reviews

## Admin Title Management

Admins should be able to:
- Create title records manually if needed
- Edit title metadata
- Delete or disable titles if needed
- Import TMDb data later
- Assign genres to titles
- Assign mood tags to titles

Important:
Admin controls metadata only. Admin should not create normal user watchlist data.

## Review Feature

Logged-in users should be able to:
- Write one review per title
- Edit their own review
- Delete their own review
- Add rating
- Mark review as spoiler
- Set review language if needed

Admins should be able to:
- Hide inappropriate reviews
- Restore hidden reviews if needed
- Delete reviews if project policy allows it

Important:
Review belongs to AppUser and Title.
Review must not be stored inside Title.

## Watchlist Feature

Logged-in users should be able to:
- Add a title to watchlist
- Update watch status
- Remove a title from watchlist
- Mark a title as favorite
- View their own watchlist

Watch statuses:
- WANT_TO_WATCH
- WATCHING
- WATCHED
- DROPPED

Important:
One user should only have one WatchlistItem per title.

## Watch Log Feature

Logged-in users should be able to:
- Create personal watch memory logs
- Select title watched
- Set watched date
- Set watch place
- Set watch company
- Mark as rewatch
- Write memory note
- Attach mood tags after watching
- View their watch history
- Edit/delete their own watch logs

Important:
WatchLog is different from WatchlistItem.
WatchlistItem is current status.
WatchLog is historical memory.

## Mood Tag Feature

Mood tags are used in two places:
1. Admin assigns mood tags to titles for recommendation.
2. Users attach mood tags to watch logs to record how they felt.

Admins should be able to:
- Create mood tags
- Edit mood tags
- Delete or disable mood tags if safe
- Assign mood tags to titles

Users should be able to:
- Choose mood tags when creating watch logs
- Use mood tags to get recommendations

## Mood-Based Recommendation Feature

MVP recommendation logic should be simple and explainable.

User selects one or more mood tags.
System returns titles connected to those mood tags.

Suggested scoring:
- Score = number of matching mood tags
- Titles matching more selected moods appear first
- Optional secondary sort by TMDb rating or CineNotes average rating

Filters may include:
- Type: movie or series
- Genre
- Runtime
- Language

Do not build AI recommendation for MVP.

## Audit Log Feature

System should record important actions such as:
- Login
- Registration
- Title created/imported/updated/deleted
- Review created/updated/deleted/moderated
- Watchlist updated
- Watch log created
- Mood tag created/updated/deleted

Admin should be able to view audit logs.

## Not MVP

Do not implement these during core refactor:
- User follow system
- Like reviews
- Comment on reviews
- Social feed
- Notifications
- Episode-level tracking
- AI recommendation
- Mobile app
