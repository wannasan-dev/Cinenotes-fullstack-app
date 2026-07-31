package com.cinenotes.auth;

import com.cinenotes.dto.UserProfileResponse;

public record AuthResponse(
        String token,
        String tokenType,
        Long expiresIn,
        UserProfileResponse user
) {
}
