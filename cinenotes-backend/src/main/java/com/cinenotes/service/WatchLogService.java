package com.cinenotes.service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinenotes.domain.MoodTag;
import com.cinenotes.domain.Title;
import com.cinenotes.domain.WatchLog;
import com.cinenotes.domain.WatchLogMood;
import com.cinenotes.dto.WatchLogCreateRequest;
import com.cinenotes.dto.WatchLogResponse;
import com.cinenotes.dto.WatchLogUpdateRequest;
import com.cinenotes.exception.ForbiddenOperationException;
import com.cinenotes.exception.InvalidOperationException;
import com.cinenotes.exception.ResourceNotFoundException;
import com.cinenotes.mapper.WatchLogMapper;
import com.cinenotes.repository.MoodTagRepository;
import com.cinenotes.repository.TitleRepository;
import com.cinenotes.repository.WatchLogMoodRepository;
import com.cinenotes.repository.WatchLogRepository;
import com.cinenotes.user.AppUser;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WatchLogService {

    private final WatchLogRepository watchLogRepository;
    private final WatchLogMoodRepository watchLogMoodRepository;
    private final TitleRepository titleRepository;
    private final MoodTagRepository moodTagRepository;
    private final CurrentUserService currentUserService;
    private final WatchLogMapper watchLogMapper;

    @Transactional
    public WatchLogResponse create(WatchLogCreateRequest request) {
        AppUser currentUser = currentUserService.getCurrentUser();
        Title title = getTitle(request.titleId());

        WatchLog watchLog = watchLogMapper.toEntity(request);
        watchLog.setUser(currentUser);
        watchLog.setTitle(title);

        WatchLog savedWatchLog = watchLogRepository.save(watchLog);
        replaceMoodTags(savedWatchLog, request.moodTagIds());

        return watchLogMapper.toResponse(savedWatchLog);
    }

    @Transactional
    public WatchLogResponse updateOwnWatchLog(Long id, WatchLogUpdateRequest request) {
        AppUser currentUser = currentUserService.getCurrentUser();
        WatchLog watchLog = getWatchLog(id);
        ensureOwner(watchLog, currentUser);

        watchLogMapper.updateEntity(watchLog, request);
        WatchLog savedWatchLog = watchLogRepository.save(watchLog);

        if (request.moodTagIds() != null) {
            replaceMoodTags(savedWatchLog, request.moodTagIds());
        }

        return watchLogMapper.toResponse(savedWatchLog);
    }

    @Transactional
    public void deleteOwnWatchLog(Long id) {
        AppUser currentUser = currentUserService.getCurrentUser();
        WatchLog watchLog = getWatchLog(id);
        ensureOwner(watchLog, currentUser);

        watchLogMoodRepository.deleteByWatchLogId(id);
        watchLogRepository.delete(watchLog);
    }

    @Transactional(readOnly = true)
    public WatchLogResponse findByIdForCurrentUser(Long id) {
        AppUser currentUser = currentUserService.getCurrentUser();
        WatchLog watchLog = getWatchLog(id);
        ensureOwner(watchLog, currentUser);

        return watchLogMapper.toResponse(watchLog);
    }

    @Transactional(readOnly = true)
    public List<WatchLogResponse> findCurrentUserWatchLogs() {
        AppUser currentUser = currentUserService.getCurrentUser();

        return watchLogRepository.findByUserIdOrderByWatchedDateDesc(currentUser.getId())
                .stream()
                .map(watchLogMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WatchLogResponse> findCurrentUserWatchLogsByTitle(Long titleId) {
        AppUser currentUser = currentUserService.getCurrentUser();
        getTitle(titleId);

        return watchLogRepository
                .findByUserIdAndTitleIdOrderByWatchedDateDesc(currentUser.getId(), titleId)
                .stream()
                .map(watchLogMapper::toResponse)
                .toList();
    }

    private WatchLog getWatchLog(Long id) {
        return watchLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Watch log not found"));
    }

    private Title getTitle(Long id) {
        return titleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Title not found"));
    }

    private void ensureOwner(WatchLog watchLog, AppUser currentUser) {
        Long ownerId = watchLog.getUser() == null ? null : watchLog.getUser().getId();
        if (!currentUser.getId().equals(ownerId)) {
            throw new ForbiddenOperationException("Only the watch log owner can access this watch log");
        }
    }

    private void replaceMoodTags(WatchLog watchLog, List<Long> moodTagIds) {
        watchLogMoodRepository.deleteByWatchLogId(watchLog.getId());
        watchLog.getWatchLogMoods().clear();

        for (MoodTag moodTag : findMoodTagsByIds(moodTagIds)) {
            WatchLogMood watchLogMood = new WatchLogMood();
            watchLogMood.setWatchLog(watchLog);
            watchLogMood.setMoodTag(moodTag);
            watchLog.getWatchLogMoods().add(watchLogMoodRepository.save(watchLogMood));
        }
    }

    private List<MoodTag> findMoodTagsByIds(List<Long> moodTagIds) {
        Set<Long> uniqueIds = normalizeIds(moodTagIds);
        if (uniqueIds.isEmpty()) {
            return List.of();
        }

        List<MoodTag> moodTags = moodTagRepository.findAllById(uniqueIds);
        if (moodTags.size() != uniqueIds.size()) {
            throw new ResourceNotFoundException("One or more mood tags were not found");
        }

        return moodTags;
    }

    private Set<Long> normalizeIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return Set.of();
        }

        Set<Long> uniqueIds = new LinkedHashSet<>();
        for (Long id : ids) {
            if (id == null) {
                throw new InvalidOperationException("Mood tag ids must not contain null values");
            }
            uniqueIds.add(id);
        }

        return uniqueIds;
    }
}
