package com.cinenotes.mapper;

import org.springframework.stereotype.Component;

import com.cinenotes.domain.Genre;
import com.cinenotes.dto.GenreRequest;
import com.cinenotes.dto.GenreResponse;

@Component
public class GenreMapper {

    public Genre toEntity(GenreRequest request) {
        if (request == null) {
            return null;
        }

        Genre genre = new Genre();
        updateEntity(genre, request);
        return genre;
    }

    public GenreResponse toResponse(Genre genre) {
        if (genre == null) {
            return null;
        }

        return new GenreResponse(
                genre.getId(),
                genre.getTmdbGenreId(),
                genre.getName()
        );
    }

    public void updateEntity(Genre genre, GenreRequest request) {
        if (genre == null || request == null) {
            return;
        }

        genre.setTmdbGenreId(request.tmdbGenreId());
        genre.setName(request.name());
    }
}
