package com.cinenotes.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cinenotes.dto.ReviewCreateRequest;
import com.cinenotes.dto.ReviewResponse;
import com.cinenotes.dto.ReviewUpdateRequest;
import com.cinenotes.service.ReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse create(@Valid @RequestBody ReviewCreateRequest request) {
        return reviewService.create(request);
    }

    @PatchMapping("/{id}")
    public ReviewResponse updateOwnReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewUpdateRequest request
    ) {
        return reviewService.updateOwnReview(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOwnReview(@PathVariable Long id) {
        reviewService.deleteOwnReview(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ReviewResponse findById(@PathVariable Long id) {
        return reviewService.findById(id);
    }

    @GetMapping("/title/{titleId}")
    public List<ReviewResponse> findVisibleReviewsByTitle(@PathVariable Long titleId) {
        return reviewService.findVisibleReviewsByTitle(titleId);
    }

    @GetMapping("/me")
    public List<ReviewResponse> findCurrentUserReviews() {
        return reviewService.findCurrentUserReviews();
    }
}
