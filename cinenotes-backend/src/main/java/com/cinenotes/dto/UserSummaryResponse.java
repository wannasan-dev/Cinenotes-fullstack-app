package com.cinenotes.dto;

public record UserSummaryResponse(
        Long id,
        String username,
        String displayName,
        String profileImage
) {
}
