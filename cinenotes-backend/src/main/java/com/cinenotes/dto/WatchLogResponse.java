package com.cinenotes.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.cinenotes.domain.WatchCompany;
import com.cinenotes.domain.WatchPlace;

public record WatchLogResponse(
        Long id,
        TitleSummaryResponse title,
        LocalDate watchedDate,
        WatchPlace watchPlace,
        WatchCompany watchCompany,
        Boolean rewatch,
        String memoryNote,
        List<MoodTagResponse> moods,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
