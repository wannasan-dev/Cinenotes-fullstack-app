package com.cinenotes.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinenotes.dto.UpdateProfileRequest;
import com.cinenotes.dto.UserProfileResponse;
import com.cinenotes.dto.UserSummaryResponse;
import com.cinenotes.exception.ResourceNotFoundException;
import com.cinenotes.mapper.AppUserMapper;
import com.cinenotes.user.AppUser;
import com.cinenotes.user.AppUserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final AppUserRepository appUserRepository;
    private final AppUserMapper appUserMapper;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile() {
        AppUser user = currentUserService.getCurrentUser();
        return appUserMapper.toProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateCurrentUserProfile(UpdateProfileRequest request) {
        AppUser user = currentUserService.getCurrentUser();
        appUserMapper.updateEntity(user, request);

        AppUser savedUser = appUserRepository.save(user);
        return appUserMapper.toProfileResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public UserSummaryResponse getPublicUserSummaryById(Long id) {
        AppUser user = appUserRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return appUserMapper.toSummaryResponse(user);
    }

    @Transactional(readOnly = true)
    public UserSummaryResponse getPublicUserSummaryByUsername(String username) {
        AppUser user = appUserRepository.findByUsernameIgnoreCaseAndIsActiveTrue(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return appUserMapper.toSummaryResponse(user);
    }
}
