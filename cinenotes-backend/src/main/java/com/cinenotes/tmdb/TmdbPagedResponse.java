package com.cinenotes.tmdb;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TmdbPagedResponse<T>(
        Integer page,
        List<T> results,
        @JsonProperty("total_pages")
        Integer totalPages,
        @JsonProperty("total_results")
        Integer totalResults
) {
}
