package com.cinenotes.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinenotes.domain.Review;
import com.cinenotes.domain.Title;
import com.cinenotes.dto.ReviewCreateRequest;
import com.cinenotes.dto.ReviewResponse;
import com.cinenotes.dto.ReviewUpdateRequest;
import com.cinenotes.exception.DuplicateResourceException;
import com.cinenotes.exception.ForbiddenOperationException;
import com.cinenotes.exception.ResourceNotFoundException;
import com.cinenotes.mapper.ReviewMapper;
import com.cinenotes.repository.ReviewRepository;
import com.cinenotes.repository.TitleRepository;
import com.cinenotes.user.AppUser;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final TitleRepository titleRepository;
    private final CurrentUserService currentUserService;
    private final ReviewMapper reviewMapper;

    @Transactional
    public ReviewResponse create(ReviewCreateRequest request) {
        AppUser currentUser = currentUserService.getCurrentUser();
        Title title = getTitle(request.titleId());

        if (reviewRepository.existsByUserIdAndTitleId(currentUser.getId(), title.getId())) {
            throw new DuplicateResourceException("User has already reviewed this title");
        }

        Review review = reviewMapper.toEntity(request);
        review.setUser(currentUser);
        review.setTitle(title);

        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse updateOwnReview(Long id, ReviewUpdateRequest request) {
        AppUser currentUser = currentUserService.getCurrentUser();
        Review review = getReview(id);
        ensureOwner(review, currentUser);

        reviewMapper.updateEntity(review, request);
        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    @Transactional
    public void deleteOwnReview(Long id) {
        AppUser currentUser = currentUserService.getCurrentUser();
        Review review = getReview(id);
        ensureOwner(review, currentUser);

        reviewRepository.delete(review);
    }

    @Transactional(readOnly = true)
    public ReviewResponse findById(Long id) {
        Review review = getReview(id);
        if (!Boolean.TRUE.equals(review.getIsVisible())) {
            throw new ResourceNotFoundException("Review not found");
        }

        return reviewMapper.toResponse(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> findVisibleReviewsByTitle(Long titleId) {
        getTitle(titleId);

        return reviewRepository.findByTitleIdAndIsVisibleTrue(titleId)
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> findCurrentUserReviews() {
        AppUser currentUser = currentUserService.getCurrentUser();

        return reviewRepository.findByUserId(currentUser.getId())
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    private Review getReview(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
    }

    private Title getTitle(Long id) {
        return titleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Title not found"));
    }

    private void ensureOwner(Review review, AppUser currentUser) {
        Long ownerId = review.getUser() == null ? null : review.getUser().getId();
        if (!currentUser.getId().equals(ownerId)) {
            throw new ForbiddenOperationException("Only the review owner can modify this review");
        }
    }
}
