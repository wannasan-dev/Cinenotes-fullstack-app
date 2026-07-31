package com.cinenotes.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinenotes.domain.WatchLogMood;

public interface WatchLogMoodRepository extends JpaRepository<WatchLogMood, Long> {

    List<WatchLogMood> findByWatchLogId(Long watchLogId);

    List<WatchLogMood> findByMoodTagId(Long moodTagId);

    Optional<WatchLogMood> findByWatchLogIdAndMoodTagId(Long watchLogId, Long moodTagId);

    boolean existsByWatchLogIdAndMoodTagId(Long watchLogId, Long moodTagId);
}
