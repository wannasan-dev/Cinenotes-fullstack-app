package com.cinenotes.tmdb;

import com.cinenotes.domain.TitleType;

public record TmdbTitleSearchResultResponse(
        Integer tmdbId,
        TitleType type,
        String name,
        String originalName,
        String overview,
        String posterPath,
        String backdropPath,
        String releaseDate,
        String originalLanguage,
        Double tmdbVoteAverage,
        Integer tmdbVoteCount,
        Boolean alreadyImported
) {
}
