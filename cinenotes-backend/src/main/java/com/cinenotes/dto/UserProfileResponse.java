package com.cinenotes.dto;

import java.time.LocalDateTime;

import com.cinenotes.user.AppRole;

public record UserProfileResponse(
        Long id,
        String username,
        String email,
        String displayName,
        String bio,
        String profileImage,
        AppRole role,
        String preferredLanguage,
        LocalDateTime createdAt
) {
}
