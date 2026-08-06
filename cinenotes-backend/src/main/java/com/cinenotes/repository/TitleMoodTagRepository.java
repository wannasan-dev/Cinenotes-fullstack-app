package com.cinenotes.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinenotes.domain.TitleMoodTag;

public interface TitleMoodTagRepository extends JpaRepository<TitleMoodTag, Long> {

    List<TitleMoodTag> findByTitleId(Long titleId);

    List<TitleMoodTag> findByMoodTagId(Long moodTagId);

    Optional<TitleMoodTag> findByTitleIdAndMoodTagId(Long titleId, Long moodTagId);

    boolean existsByTitleIdAndMoodTagId(Long titleId, Long moodTagId);

    boolean existsByMoodTagId(Long moodTagId);

    void deleteByTitleId(Long titleId);
}
