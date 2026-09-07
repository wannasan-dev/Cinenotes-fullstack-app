package com.cinenotes.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinenotes.domain.MoodTag;

public interface MoodTagRepository extends JpaRepository<MoodTag, Long> {

    List<MoodTag> findAllByOrderByNameAsc();

    Optional<MoodTag> findByName(String name);

    Optional<MoodTag> findByNameIgnoreCase(String name);

    boolean existsByName(String name);

    boolean existsByNameIgnoreCase(String name);
}
