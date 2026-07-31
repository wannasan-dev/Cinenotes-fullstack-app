package com.cinenotes.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cinenotes.domain.Title;
import com.cinenotes.domain.TitleType;

public interface TitleRepository extends JpaRepository<Title, Long>{

	Optional<Title> findByTmdbIdAndType(Long tmdbId, TitleType type);

	boolean existsByTmdbIdAndType(Long tmdbId, TitleType type);

	List<Title> findByNameContainingIgnoreCase(String name);

	List<Title> findByType(TitleType type);

	List<Title> findDistinctByTitleGenres_Genre_NameIgnoreCase(String genreName);

	List<Title> findDistinctByTitleMoodTags_MoodTag_NameIgnoreCase(String moodTagName);

	@Query("""
	        SELECT DISTINCT t FROM Title t
	        LEFT JOIN t.titleGenres tg
	        LEFT JOIN tg.genre g
	        WHERE (:type IS NULL OR t.type = :type)
	        AND (:genre IS NULL OR LOWER(g.name) = LOWER(:genre))
	        AND (:keyword IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
	        """)
	List<Title> findAllWithFilters(
	        @Param("type") TitleType type,
	        @Param("genre") String genre,
	        @Param("keyword") String keyword
	);

	@Query("""
	        SELECT DISTINCT t FROM Title t
	        LEFT JOIN t.titleGenres tg
	        LEFT JOIN tg.genre g
	        LEFT JOIN t.titleMoodTags tmt
	        LEFT JOIN tmt.moodTag mt
	        WHERE (:type IS NULL OR t.type = :type)
	        AND (:genre IS NULL OR LOWER(g.name) = LOWER(:genre))
	        AND (:moodTag IS NULL OR LOWER(mt.name) = LOWER(:moodTag))
	        AND (:keyword IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
	        """)
	List<Title> findAllWithFilters(
	        @Param("type") TitleType type,
	        @Param("genre") String genre,
	        @Param("moodTag") String moodTag,
	        @Param("keyword") String keyword
	);
}
