package com.cinenotes.dto;

import java.time.LocalDate;
import java.util.List;

import com.cinenotes.domain.WatchCompany;
import com.cinenotes.domain.WatchPlace;

import jakarta.validation.constraints.Size;

public record WatchLogUpdateRequest(
        LocalDate watchedDate,

        WatchPlace watchPlace,

        WatchCompany watchCompany,

        Boolean rewatch,

        @Size(max = 5000, message = "memoryNote must be at most 5000 characters")
        String memoryNote,

        List<Long> moodTagIds
) {
}
