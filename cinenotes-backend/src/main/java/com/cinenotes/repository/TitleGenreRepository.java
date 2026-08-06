package com.cinenotes.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinenotes.domain.TitleGenre;

public interface TitleGenreRepository extends JpaRepository<TitleGenre, Long> {

    List<TitleGenre> findByTitleId(Long titleId);

    List<TitleGenre> findByGenreId(Long genreId);

    Optional<TitleGenre> findByTitleIdAndGenreId(Long titleId, Long genreId);

    boolean existsByTitleIdAndGenreId(Long titleId, Long genreId);

    boolean existsByGenreId(Long genreId);

    void deleteByTitleId(Long titleId);
}
