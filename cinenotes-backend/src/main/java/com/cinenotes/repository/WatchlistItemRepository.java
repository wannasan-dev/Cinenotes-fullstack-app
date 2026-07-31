package com.cinenotes.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinenotes.domain.WatchlistItem;

public interface WatchlistItemRepository extends JpaRepository<WatchlistItem, Long> {

    List<WatchlistItem> findByUserId(Long userId);

    Optional<WatchlistItem> findByUserIdAndTitleId(Long userId, Long titleId);

    boolean existsByUserIdAndTitleId(Long userId, Long titleId);
}
