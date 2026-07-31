package com.cinenotes.dto;

import com.cinenotes.domain.WatchStatus;

import jakarta.validation.constraints.NotNull;

public record WatchlistUpsertRequest(
        @NotNull(message = "titleId is required")
        Long titleId,

        @NotNull(message = "status is required")
        WatchStatus status,

        Boolean favorite
) {
}
