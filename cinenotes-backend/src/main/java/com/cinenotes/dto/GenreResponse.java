package com.cinenotes.dto;

public record GenreResponse(
        Long id,
        Integer tmdbGenreId,
        String name
) {
}
