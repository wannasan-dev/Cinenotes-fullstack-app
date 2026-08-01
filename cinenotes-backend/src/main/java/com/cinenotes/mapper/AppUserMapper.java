package com.cinenotes.mapper;

import org.springframework.stereotype.Component;

import com.cinenotes.dto.UpdateProfileRequest;
import com.cinenotes.dto.UserAdminResponse;
import com.cinenotes.dto.UserProfileResponse;
import com.cinenotes.dto.UserSummaryResponse;
import com.cinenotes.user.AppUser;

@Component
public class AppUserMapper {

    public UserSummaryResponse toSummaryResponse(AppUser user) {
        if (user == null) {
            return null;
        }

        return new UserSummaryResponse(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getProfileImage()
        );
    }

    public UserProfileResponse toProfileResponse(AppUser user) {
        if (user == null) {
            return null;
        }

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                user.getBio(),
                user.getProfileImage(),
                user.getRole(),
                user.getPreferredLanguage(),
                user.getCreatedAt()
        );
    }

    public UserAdminResponse toAdminResponse(AppUser user) {
        if (user == null) {
            return null;
        }

        return new UserAdminResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole(),
                user.getIsActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public void updateEntity(AppUser user, UpdateProfileRequest request) {
        if (user == null || request == null) {
            return;
        }

        if (request.displayName() != null) {
            user.setDisplayName(request.displayName());
        }

        if (request.bio() != null) {
            user.setBio(request.bio());
        }

        if (request.profileImage() != null) {
            user.setProfileImage(request.profileImage());
        }

        if (request.preferredLanguage() != null) {
            user.setPreferredLanguage(request.preferredLanguage());
        }
    }
}
