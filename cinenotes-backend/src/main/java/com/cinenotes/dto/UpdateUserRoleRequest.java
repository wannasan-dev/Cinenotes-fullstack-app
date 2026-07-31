package com.cinenotes.dto;

import com.cinenotes.user.AppRole;

import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(
        @NotNull(message = "role is required")
        AppRole role
) {
}
