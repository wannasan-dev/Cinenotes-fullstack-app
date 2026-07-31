package com.cinenotes.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinenotes.domain.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByOrderByCreatedAtDesc();

    List<AuditLog> findByActorUserIdOrderByCreatedAtDesc(Long actorUserId);
}
