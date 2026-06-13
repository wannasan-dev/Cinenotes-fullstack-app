package com.cinenotes.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cinenotes.domain.Genre;
import com.cinenotes.domain.Title;
import com.cinenotes.domain.TitleType;

public interface TitleRepository extends JpaRepository<Title, Long>{

	@Query("""
	        SELECT DISTINCT t FROM Title t
	        LEFT JOIN t.genres g
	        WHERE (:type IS NULL OR t.type = :type)
	        AND (:genre IS NULL OR g = :genre)
	        AND (:keyword IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
	        """)
	List<Title> findAllWithFilters(
	        @Param("type") TitleType type,
	        @Param("genre") Genre genre,
	        @Param("keyword") String keyword
	);
}
