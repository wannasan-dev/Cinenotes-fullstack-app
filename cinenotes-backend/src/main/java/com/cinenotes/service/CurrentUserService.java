package com.cinenotes.service;

import java.security.Principal;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinenotes.exception.ForbiddenOperationException;
import com.cinenotes.exception.InactiveAccountException;
import com.cinenotes.user.AppUser;
import com.cinenotes.user.AppUserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final AppUserRepository appUserRepository;

    @Transactional(readOnly = true)
    public AppUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new ForbiddenOperationException("Authentication is required");
        }

        String identifier = resolveIdentifier(authentication);
        if (identifier == null || identifier.isBlank()) {
            throw new ForbiddenOperationException("Authenticated user could not be resolved");
        }

        AppUser user = appUserRepository.findByUsernameIgnoreCase(identifier)
                .or(() -> appUserRepository.findByEmail(identifier))
                .orElseThrow(() -> new ForbiddenOperationException("Authenticated user was not found"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new InactiveAccountException("Account is inactive");
        }

        return user;
    }

    private String resolveIdentifier(Authentication authentication) {
        Object principal = authentication.getPrincipal();

        if (principal instanceof Jwt jwt) {
            return jwt.getSubject();
        }

        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }

        if (principal instanceof Principal securityPrincipal) {
            return securityPrincipal.getName();
        }

        if (principal instanceof String principalName && !"anonymousUser".equals(principalName)) {
            return principalName;
        }

        return authentication.getName();
    }
}
