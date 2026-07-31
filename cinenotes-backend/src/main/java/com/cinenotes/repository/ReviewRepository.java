package com.cinenotes.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinenotes.domain.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByTitleId(Long titleId);

    List<Review> findByUserId(Long userId);

    Optional<Review> findByUserIdAndTitleId(Long userId, Long titleId);

    boolean existsByUserIdAndTitleId(Long userId, Long titleId);

    List<Review> findByTitleIdAndIsVisibleTrue(Long titleId);
}
