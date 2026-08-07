package com.cinenotes.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinenotes.dto.AuditLogResponse;
import com.cinenotes.service.AuditLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminAuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public List<AuditLogResponse> findRecent() {
        return auditLogService.findRecent();
    }

    @GetMapping("/actor/{actorUserId}")
    public List<AuditLogResponse> findByActorUserId(@PathVariable Long actorUserId) {
        return auditLogService.findByActorUserId(actorUserId);
    }
}
