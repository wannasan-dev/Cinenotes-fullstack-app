package com.cinenotes.dto;

import java.time.LocalDateTime;

import com.cinenotes.domain.WatchStatus;

public record WatchlistItemResponse(
        Long id,
        TitleSummaryResponse title,
        WatchStatus status,
        Boolean favorite,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
