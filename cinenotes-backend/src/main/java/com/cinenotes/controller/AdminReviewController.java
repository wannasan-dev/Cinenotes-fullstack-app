package com.cinenotes.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinenotes.dto.ReviewResponse;
import com.cinenotes.service.ReviewModerationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminReviewController {

    private final ReviewModerationService reviewModerationService;

    @PatchMapping("/{id}/hide")
    public ReviewResponse hideReview(@PathVariable Long id) {
        return reviewModerationService.hideReview(id);
    }

    @PatchMapping("/{id}/restore")
    public ReviewResponse restoreReview(@PathVariable Long id) {
        return reviewModerationService.restoreReview(id);
    }
}
