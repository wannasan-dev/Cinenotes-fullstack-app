package com.cinenotes.dto;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        UserSummaryResponse user,
        Long titleId,
        String titleName,
        Double rating,
        String reviewText,
        String reviewLanguage,
        Boolean containsSpoiler,
        Boolean visible,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
