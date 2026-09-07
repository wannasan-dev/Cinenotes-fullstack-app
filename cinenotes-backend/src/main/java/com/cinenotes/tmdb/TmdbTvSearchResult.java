package com.cinenotes.tmdb;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TmdbTvSearchResult(
        Integer id,
        String name,
        @JsonProperty("original_name")
        String originalName,
        String overview,
        @JsonProperty("poster_path")
        String posterPath,
        @JsonProperty("backdrop_path")
        String backdropPath,
        @JsonProperty("first_air_date")
        String firstAirDate,
        @JsonProperty("original_language")
        String originalLanguage,
        @JsonProperty("vote_average")
        Double voteAverage,
        @JsonProperty("vote_count")
        Integer voteCount,
        @JsonProperty("genre_ids")
        List<Integer> genreIds
) {
}
