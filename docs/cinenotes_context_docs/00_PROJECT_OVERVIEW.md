# CineNotes Project Overview

## Purpose

CineNotes is being refactored from a simple movie/series review application into a personal movie/series tracker and mood-based recommendation platform.

The previous version already included basic title CRUD, public/admin view switching, search, filter, sort, review modal, add/edit/delete title features, JWT authentication, and admin-only protected backend endpoints.

The new MVP should be redesigned around user-specific activity: reviews, watchlist items, watch logs, moods after watching, and mood-based recommendations.

## Current Technology Stack

Backend:
- Java Spring Boot
- Spring Data JPA
- MySQL
- JWT authentication

Frontend:
- React
- TypeScript
- Vite

## Main Refactor Reason

The old version stored review/rating data directly inside the `Title` entity.

That design is no longer suitable because:
- One title can have many reviews from many users.
- A user needs their own watchlist and watch status.
- A user needs personal watch memory logs.
- Mood-based recommendation needs mood tags connected to titles and watch logs.
- Admins need moderation and data management features.

## New Product Vision

CineNotes should become a personal movie/series companion where users can:
- Browse movie and series titles.
- Register and log in.
- Write personal reviews.
- Add titles to a watchlist.
- Mark watch status.
- Record watch memories.
- Record moods after watching.
- Receive recommendations based on mood tags.

Admins should be able to:
- Manage imported TMDb title data.
- Manage genres.
- Manage mood tags.
- Moderate reviews.
- View audit logs.

## MVP Priority

Build the core personal tracker first. Do not add advanced social features yet.

MVP features:
1. Authentication with USER and ADMIN roles
2. Public title browsing
3. Admin title management
4. Review system
5. Watchlist system
6. Watch log system
7. Mood tag system
8. Mood-based recommendation
9. Admin review moderation
10. Audit log tracking

Future features, not MVP:
- Follow users
- Like reviews
- Comment on reviews
- Social feed
- AI recommendation
- Mobile app
- Notifications
- Episode-level tracking
