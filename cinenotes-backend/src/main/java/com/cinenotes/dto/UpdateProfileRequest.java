package com.cinenotes.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 100, message = "displayName must be at most 100 characters")
        String displayName,

        @Size(max = 2000, message = "bio must be at most 2000 characters")
        String bio,

        @Size(max = 1000, message = "profileImage must be at most 1000 characters")
        String profileImage,

        @Size(max = 20, message = "preferredLanguage must be at most 20 characters")
        String preferredLanguage
) {
}
