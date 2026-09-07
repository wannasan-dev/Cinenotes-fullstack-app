package com.cinenotes.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cinenotes.domain.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByTitleId(Long titleId);

    List<Review> findByUserId(Long userId);

    Optional<Review> findByUserIdAndTitleId(Long userId, Long titleId);

    boolean existsByUserIdAndTitleId(Long userId, Long titleId);

    List<Review> findByTitleIdAndIsVisibleTrue(Long titleId);

    List<Review> findByIsVisible(Boolean isVisible);

    boolean existsByTitleId(Long titleId);

    @Query("""
            select r.title.id as titleId,
                   avg(r.rating) as averageRating,
                   count(r.rating) as ratingCount
            from Review r
            where r.isVisible = true
              and r.rating is not null
              and r.title.id in :titleIds
            group by r.title.id
            """)
    List<TitleRatingAggregate> findVisibleRatingAggregatesByTitleIds(
            @Param("titleIds") List<Long> titleIds
    );
}
