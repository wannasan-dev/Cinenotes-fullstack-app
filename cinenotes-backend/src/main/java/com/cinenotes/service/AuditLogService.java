package com.cinenotes.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinenotes.domain.AuditAction;
import com.cinenotes.domain.AuditLog;
import com.cinenotes.dto.AuditLogResponse;
import com.cinenotes.exception.InvalidOperationException;
import com.cinenotes.mapper.AuditLogMapper;
import com.cinenotes.repository.AuditLogRepository;
import com.cinenotes.user.AppUser;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;
    private final AdminAuthorizationService adminAuthorizationService;

    @Transactional
    public void log(
            AppUser actor,
            AuditAction action,
            String targetType,
            Long targetId,
            String description
    ) {
        if (actor == null) {
            throw new InvalidOperationException("Audit actor is required");
        }

        if (action == null) {
            throw new InvalidOperationException("Audit action is required");
        }

        AuditLog auditLog = new AuditLog();
        auditLog.setActorUser(actor);
        auditLog.setAction(action);
        auditLog.setTargetType(targetType);
        auditLog.setTargetId(targetId);
        auditLog.setDescription(description);

        auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> findRecent() {
        adminAuthorizationService.requireAdmin();

        return auditLogRepository.findByOrderByCreatedAtDesc()
                .stream()
                .map(auditLogMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> findByActorUserId(Long actorUserId) {
        adminAuthorizationService.requireAdmin();

        return auditLogRepository.findByActorUserIdOrderByCreatedAtDesc(actorUserId)
                .stream()
                .map(auditLogMapper::toResponse)
                .toList();
    }
}
