package com.cinenotes.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinenotes.domain.AuditAction;
import com.cinenotes.domain.MoodTag;
import com.cinenotes.dto.MoodTagRequest;
import com.cinenotes.dto.MoodTagResponse;
import com.cinenotes.exception.DuplicateResourceException;
import com.cinenotes.exception.InvalidOperationException;
import com.cinenotes.exception.ResourceNotFoundException;
import com.cinenotes.mapper.MoodTagMapper;
import com.cinenotes.repository.MoodTagRepository;
import com.cinenotes.repository.TitleMoodTagRepository;
import com.cinenotes.repository.WatchLogMoodRepository;
import com.cinenotes.user.AppUser;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MoodTagService {

    private static final String TARGET_MOOD_TAG = "MOOD_TAG";

    private final MoodTagRepository moodTagRepository;
    private final TitleMoodTagRepository titleMoodTagRepository;
    private final WatchLogMoodRepository watchLogMoodRepository;
    private final MoodTagMapper moodTagMapper;
    private final AdminAuthorizationService adminAuthorizationService;
    private final AuditLogService auditLogService;

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
        AppUser actor = adminAuthorizationService.requireAdmin();
        ensureUniqueName(request.name(), null);

        MoodTag moodTag = moodTagMapper.toEntity(request);
        MoodTag savedMoodTag = moodTagRepository.save(moodTag);
        auditLogService.log(
                actor,
                AuditAction.MOOD_TAG_CREATED,
                TARGET_MOOD_TAG,
                savedMoodTag.getId(),
                "Created mood tag " + savedMoodTag.getName()
        );

        return moodTagMapper.toResponse(savedMoodTag);
    }

    @Transactional
    public MoodTagResponse update(Long id, MoodTagRequest request) {
        AppUser actor = adminAuthorizationService.requireAdmin();
        MoodTag moodTag = getMoodTag(id);
        ensureUniqueName(request.name(), id);

        moodTagMapper.updateEntity(moodTag, request);
        MoodTag savedMoodTag = moodTagRepository.save(moodTag);
        auditLogService.log(
                actor,
                AuditAction.MOOD_TAG_UPDATED,
                TARGET_MOOD_TAG,
                savedMoodTag.getId(),
                "Updated mood tag " + savedMoodTag.getName()
        );

        return moodTagMapper.toResponse(savedMoodTag);
    }

    @Transactional
    public void delete(Long id) {
        AppUser actor = adminAuthorizationService.requireAdmin();
        MoodTag moodTag = getMoodTag(id);

        if (titleMoodTagRepository.existsByMoodTagId(id)) {
            throw new InvalidOperationException("Mood tag is assigned to one or more titles");
        }

        if (watchLogMoodRepository.existsByMoodTagId(id)) {
            throw new InvalidOperationException("Mood tag is assigned to one or more watch logs");
        }

        moodTagRepository.delete(moodTag);
        auditLogService.log(
                actor,
                AuditAction.MOOD_TAG_DELETED,
                TARGET_MOOD_TAG,
                id,
                "Deleted mood tag " + moodTag.getName()
        );
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
