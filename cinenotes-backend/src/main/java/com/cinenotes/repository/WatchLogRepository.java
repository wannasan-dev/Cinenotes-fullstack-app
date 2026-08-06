package com.cinenotes.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinenotes.domain.WatchLog;

public interface WatchLogRepository extends JpaRepository<WatchLog, Long> {

    List<WatchLog> findByUserId(Long userId);

    List<WatchLog> findByUserIdAndTitleId(Long userId, Long titleId);

    List<WatchLog> findByUserIdAndTitleIdOrderByWatchedDateDesc(Long userId, Long titleId);

    List<WatchLog> findByUserIdOrderByWatchedDateDesc(Long userId);
}
