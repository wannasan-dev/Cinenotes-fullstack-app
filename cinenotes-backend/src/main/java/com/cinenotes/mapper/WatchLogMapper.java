package com.cinenotes.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import com.cinenotes.domain.MoodTag;
import com.cinenotes.domain.WatchLog;
import com.cinenotes.domain.WatchLogMood;
import com.cinenotes.dto.MoodTagResponse;
import com.cinenotes.dto.WatchLogCreateRequest;
import com.cinenotes.dto.WatchLogResponse;
import com.cinenotes.dto.WatchLogUpdateRequest;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WatchLogMapper {

    private final TitleMapper titleMapper;
    private final MoodTagMapper moodTagMapper;

    public WatchLog toEntity(WatchLogCreateRequest request) {
        if (request == null) {
            return null;
        }

        WatchLog watchLog = new WatchLog();
        watchLog.setWatchedDate(request.watchedDate());
        watchLog.setWatchPlace(request.watchPlace());
        watchLog.setWatchCompany(request.watchCompany());
        watchLog.setIsRewatch(Boolean.TRUE.equals(request.rewatch()));
        watchLog.setMemoryNote(request.memoryNote());
        return watchLog;
    }

    public WatchLogResponse toResponse(WatchLog watchLog) {
        if (watchLog == null) {
            return null;
        }

        return new WatchLogResponse(
                watchLog.getId(),
                titleMapper.toSummaryResponse(watchLog.getTitle()),
                watchLog.getWatchedDate(),
                watchLog.getWatchPlace(),
                watchLog.getWatchCompany(),
                watchLog.getIsRewatch(),
                watchLog.getMemoryNote(),
                toMoodResponses(watchLog),
                watchLog.getCreatedAt(),
                watchLog.getUpdatedAt()
        );
    }

    public void updateEntity(WatchLog watchLog, WatchLogUpdateRequest request) {
        if (watchLog == null || request == null) {
            return;
        }

        watchLog.setWatchedDate(request.watchedDate());
        watchLog.setWatchPlace(request.watchPlace());
        watchLog.setWatchCompany(request.watchCompany());
        watchLog.setIsRewatch(Boolean.TRUE.equals(request.rewatch()));
        watchLog.setMemoryNote(request.memoryNote());
    }

    private List<MoodTagResponse> toMoodResponses(WatchLog watchLog) {
        if (watchLog.getWatchLogMoods() == null) {
            return List.of();
        }

        return watchLog.getWatchLogMoods()
                .stream()
                .map(WatchLogMood::getMoodTag)
                .map(this::toMoodResponse)
                .toList();
    }

    private MoodTagResponse toMoodResponse(MoodTag moodTag) {
        return moodTagMapper.toResponse(moodTag);
    }
}
