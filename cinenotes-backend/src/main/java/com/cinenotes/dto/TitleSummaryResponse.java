package com.cinenotes.dto;

import java.time.LocalDate;

import com.cinenotes.domain.TitleType;

public record TitleSummaryResponse(
        Long id,
        Long tmdbId,
        TitleType type,
        String name,
        String posterPath,
        LocalDate releaseDate
) {
}
