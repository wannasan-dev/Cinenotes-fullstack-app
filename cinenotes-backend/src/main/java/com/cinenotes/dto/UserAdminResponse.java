package com.cinenotes.dto;

import java.time.LocalDateTime;

import com.cinenotes.user.AppRole;

public record UserAdminResponse(
        Long id,
        String username,
        String email,
        String displayName,
        AppRole role,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
