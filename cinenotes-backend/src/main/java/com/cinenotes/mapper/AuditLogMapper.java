package com.cinenotes.mapper;

import org.springframework.stereotype.Component;

import com.cinenotes.domain.AuditLog;
import com.cinenotes.dto.AuditLogResponse;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AuditLogMapper {

    private final AppUserMapper appUserMapper;

    public AuditLogResponse toResponse(AuditLog auditLog) {
        if (auditLog == null) {
            return null;
        }

        return new AuditLogResponse(
                auditLog.getId(),
                appUserMapper.toSummaryResponse(auditLog.getActorUser()),
                auditLog.getAction(),
                auditLog.getTargetType(),
                auditLog.getTargetId(),
                auditLog.getDescription(),
                auditLog.getCreatedAt()
        );
    }
}
