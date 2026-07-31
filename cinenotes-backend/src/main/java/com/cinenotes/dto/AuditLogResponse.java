package com.cinenotes.dto;

import java.time.LocalDateTime;

import com.cinenotes.domain.AuditAction;

public record AuditLogResponse(
        Long id,
        UserSummaryResponse actor,
        AuditAction action,
        String targetType,
        Long targetId,
        String description,
        LocalDateTime createdAt
) {
}
