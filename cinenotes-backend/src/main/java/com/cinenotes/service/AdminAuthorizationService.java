package com.cinenotes.service;

import org.springframework.stereotype.Service;

import com.cinenotes.exception.ForbiddenOperationException;
import com.cinenotes.user.AppRole;
import com.cinenotes.user.AppUser;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminAuthorizationService {

    private final CurrentUserService currentUserService;

    public AppUser requireAdmin() {
        AppUser currentUser = currentUserService.getCurrentUser();

        if (currentUser.getRole() != AppRole.ADMIN) {
            throw new ForbiddenOperationException("Admin role is required");
        }

        return currentUser;
    }
}
