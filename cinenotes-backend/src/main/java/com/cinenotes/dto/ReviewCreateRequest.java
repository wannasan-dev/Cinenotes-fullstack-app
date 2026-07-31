package com.cinenotes.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReviewCreateRequest(
        @NotNull(message = "titleId is required")
        Long titleId,

        @NotNull(message = "rating is required")
        @DecimalMin(value = "0.0", message = "rating must be at least 0")
        @DecimalMax(value = "10.0", message = "rating must be at most 10")
        Double rating,

        @Size(max = 5000, message = "reviewText must be at most 5000 characters")
        String reviewText,

        @Size(max = 20, message = "reviewLanguage must be at most 20 characters")
        String reviewLanguage,

        Boolean containsSpoiler
) {
}
