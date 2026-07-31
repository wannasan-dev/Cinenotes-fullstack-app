package com.cinenotes.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReviewModerationRequest(
        @NotNull(message = "visible is required")
        Boolean visible,

        @Size(max = 500, message = "reason must be at most 500 characters")
        String reason
) {
}
