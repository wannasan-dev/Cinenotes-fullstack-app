package com.cinenotes.tmdb;

import java.util.List;

public record TmdbSearchResponse(
        Integer page,
        Integer totalPages,
        Integer totalResults,
        List<TmdbTitleSearchResultResponse> results
) {
}
