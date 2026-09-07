package com.cinenotes.tmdb;

import java.util.List;

public record TmdbImportSummaryResponse(
        Integer imported,
        Integer skipped,
        Integer failed,
        List<String> failureMessages
) {
}
