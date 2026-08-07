package com.cinenotes.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinenotes.domain.AuditAction;
import com.cinenotes.domain.Review;
import com.cinenotes.dto.ReviewResponse;
import com.cinenotes.exception.InvalidOperationException;
import com.cinenotes.exception.ResourceNotFoundException;
import com.cinenotes.mapper.ReviewMapper;
import com.cinenotes.repository.ReviewRepository;
import com.cinenotes.user.AppUser;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewModerationService {

    private static final String TARGET_REVIEW = "REVIEW";

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final AdminAuthorizationService adminAuthorizationService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<ReviewResponse> findAll(Boolean visible) {
        adminAuthorizationService.requireAdmin();

        List<Review> reviews = visible == null
                ? reviewRepository.findAll()
                : reviewRepository.findByIsVisible(visible);

        return reviews.stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    @Transactional
    public ReviewResponse hideReview(Long id) {
        AppUser actor = adminAuthorizationService.requireAdmin();
        Review review = getReview(id);

        if (!Boolean.TRUE.equals(review.getIsVisible())) {
            throw new InvalidOperationException("Review is already hidden");
        }

        review.setIsVisible(false);
        Review savedReview = reviewRepository.save(review);
        auditLogService.log(
                actor,
                AuditAction.REVIEW_HIDDEN,
                TARGET_REVIEW,
                savedReview.getId(),
                "Hidden review"
        );

        return reviewMapper.toResponse(savedReview);
    }

    @Transactional
    public ReviewResponse restoreReview(Long id) {
        AppUser actor = adminAuthorizationService.requireAdmin();
        Review review = getReview(id);

        if (Boolean.TRUE.equals(review.getIsVisible())) {
            throw new InvalidOperationException("Review is already visible");
        }

        review.setIsVisible(true);
        Review savedReview = reviewRepository.save(review);
        auditLogService.log(
                actor,
                AuditAction.REVIEW_RESTORED,
                TARGET_REVIEW,
                savedReview.getId(),
                "Restored review"
        );

        return reviewMapper.toResponse(savedReview);
    }

    private Review getReview(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
    }
}
