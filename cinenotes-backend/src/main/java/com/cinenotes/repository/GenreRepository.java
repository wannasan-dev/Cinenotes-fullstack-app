package com.cinenotes.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinenotes.domain.Genre;

public interface GenreRepository extends JpaRepository<Genre, Long> {

    Optional<Genre> findByName(String name);

    boolean existsByName(String name);

    Optional<Genre> findByTmdbGenreId(Integer tmdbGenreId);
}
