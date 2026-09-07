package com.cinenotes.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TmdbProductionCountryDto(
        @JsonProperty("iso_3166_1")
        String isoCode,
        String name
) {
}
