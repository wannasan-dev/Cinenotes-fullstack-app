package com.cinenotes.tmdb;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TmdbMovieDetails(
        Integer id,
        String title,
        @JsonProperty("original_title")
        String originalTitle,
        String overview,
        @JsonProperty("poster_path")
        String posterPath,
        @JsonProperty("backdrop_path")
        String backdropPath,
        @JsonProperty("release_date")
        String releaseDate,
        Integer runtime,
        @JsonProperty("original_language")
        String originalLanguage,
        @JsonProperty("origin_country")
        List<String> originCountry,
        @JsonProperty("production_countries")
        List<TmdbProductionCountryDto> productionCountries,
        @JsonProperty("vote_average")
        Double voteAverage,
        @JsonProperty("vote_count")
        Integer voteCount,
        List<TmdbGenreDto> genres
) {
}
