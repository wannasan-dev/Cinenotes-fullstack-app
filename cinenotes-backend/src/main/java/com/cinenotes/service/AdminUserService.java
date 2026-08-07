package com.cinenotes.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinenotes.domain.AuditAction;
import com.cinenotes.dto.UpdateUserRoleRequest;
import com.cinenotes.dto.UserAdminResponse;
import com.cinenotes.exception.InvalidOperationException;
import com.cinenotes.exception.ResourceNotFoundException;
import com.cinenotes.mapper.AppUserMapper;
import com.cinenotes.user.AppRole;
import com.cinenotes.user.AppUser;
import com.cinenotes.user.AppUserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private static final String TARGET_USER = "USER";

    private final AppUserRepository appUserRepository;
    private final AppUserMapper appUserMapper;
    private final AdminAuthorizationService adminAuthorizationService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<UserAdminResponse> findAll() {
        adminAuthorizationService.requireAdmin();

        return appUserRepository.findAll()
                .stream()
                .map(appUserMapper::toAdminResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserAdminResponse findById(Long id) {
        adminAuthorizationService.requireAdmin();

        return appUserMapper.toAdminResponse(getUser(id));
    }

    @Transactional
    public UserAdminResponse updateRole(Long id, UpdateUserRoleRequest request) {
        AppUser actor = adminAuthorizationService.requireAdmin();
        AppUser user = getUser(id);
        AppRole requestedRole = request.role();

        if (user.getRole() == requestedRole) {
            throw new InvalidOperationException("User already has the requested role");
        }

        if (actor.getId().equals(user.getId()) && requestedRole != AppRole.ADMIN) {
            throw new InvalidOperationException("Admin cannot remove their own admin role");
        }

        AppRole previousRole = user.getRole();
        user.setRole(requestedRole);

        AppUser savedUser = appUserRepository.save(user);
        auditLogService.log(
                actor,
                AuditAction.USER_ROLE_UPDATED,
                TARGET_USER,
                savedUser.getId(),
                "Changed user role from " + previousRole + " to " + requestedRole
        );

        return appUserMapper.toAdminResponse(savedUser);
    }

    @Transactional
    public UserAdminResponse activate(Long id) {
        AppUser actor = adminAuthorizationService.requireAdmin();
        AppUser user = getUser(id);

        if (Boolean.TRUE.equals(user.getIsActive())) {
            throw new InvalidOperationException("User is already active");
        }

        user.setIsActive(true);
        AppUser savedUser = appUserRepository.save(user);
        auditLogService.log(
                actor,
                AuditAction.USER_ACTIVATED,
                TARGET_USER,
                savedUser.getId(),
                "Activated user account"
        );

        return appUserMapper.toAdminResponse(savedUser);
    }

    @Transactional
    public UserAdminResponse deactivate(Long id) {
        AppUser actor = adminAuthorizationService.requireAdmin();
        AppUser user = getUser(id);

        if (actor.getId().equals(user.getId())) {
            throw new InvalidOperationException("Admin cannot deactivate their own account");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new InvalidOperationException("User is already inactive");
        }

        user.setIsActive(false);
        AppUser savedUser = appUserRepository.save(user);
        auditLogService.log(
                actor,
                AuditAction.USER_DEACTIVATED,
                TARGET_USER,
                savedUser.getId(),
                "Deactivated user account"
        );

        return appUserMapper.toAdminResponse(savedUser);
    }

    private AppUser getUser(Long id) {
        return appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
