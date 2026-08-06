package com.cinenotes.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinenotes.domain.MoodTag;

public interface MoodTagRepository extends JpaRepository<MoodTag, Long> {

    Optional<MoodTag> findByName(String name);

    Optional<MoodTag> findByNameIgnoreCase(String name);

    boolean existsByName(String name);

    boolean existsByNameIgnoreCase(String name);
}
