package com.cinenotes.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinenotes.domain.MoodTag;
import com.cinenotes.dto.MoodTagRequest;
import com.cinenotes.dto.MoodTagResponse;
import com.cinenotes.exception.DuplicateResourceException;
import com.cinenotes.exception.InvalidOperationException;
import com.cinenotes.exception.ResourceNotFoundException;
import com.cinenotes.mapper.MoodTagMapper;
import com.cinenotes.repository.MoodTagRepository;
import com.cinenotes.repository.TitleMoodTagRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MoodTagService {

    private final MoodTagRepository moodTagRepository;
    private final TitleMoodTagRepository titleMoodTagRepository;
    private final MoodTagMapper moodTagMapper;

    @Transactional(readOnly = true)
    public List<MoodTagResponse> findAll() {
        return moodTagRepository.findAll()
                .stream()
                .map(moodTagMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MoodTagResponse findById(Long id) {
        return moodTagMapper.toResponse(getMoodTag(id));
    }

    @Transactional
    public MoodTagResponse create(MoodTagRequest request) {
        ensureUniqueName(request.name(), null);

        MoodTag moodTag = moodTagMapper.toEntity(request);
        return moodTagMapper.toResponse(moodTagRepository.save(moodTag));
    }

    @Transactional
    public MoodTagResponse update(Long id, MoodTagRequest request) {
        MoodTag moodTag = getMoodTag(id);
        ensureUniqueName(request.name(), id);

        moodTagMapper.updateEntity(moodTag, request);
        return moodTagMapper.toResponse(moodTagRepository.save(moodTag));
    }

    @Transactional
    public void delete(Long id) {
        MoodTag moodTag = getMoodTag(id);

        if (titleMoodTagRepository.existsByMoodTagId(id)) {
            throw new InvalidOperationException("Mood tag is assigned to one or more titles");
        }

        moodTagRepository.delete(moodTag);
    }

    private MoodTag getMoodTag(Long id) {
        return moodTagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mood tag not found"));
    }

    private void ensureUniqueName(String name, Long currentMoodTagId) {
        moodTagRepository.findByNameIgnoreCase(name)
                .filter(existingMoodTag -> !existingMoodTag.getId().equals(currentMoodTagId))
                .ifPresent(existingMoodTag -> {
                    throw new DuplicateResourceException("Mood tag name already exists");
                });
    }
}
