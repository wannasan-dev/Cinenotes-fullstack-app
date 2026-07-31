package com.cinenotes.mapper;

import org.springframework.stereotype.Component;

import com.cinenotes.domain.Review;
import com.cinenotes.dto.ReviewCreateRequest;
import com.cinenotes.dto.ReviewResponse;
import com.cinenotes.dto.ReviewUpdateRequest;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReviewMapper {

    private final AppUserMapper appUserMapper;

    public Review toEntity(ReviewCreateRequest request) {
        if (request == null) {
            return null;
        }

        Review review = new Review();
        review.setRating(request.rating());
        review.setReviewText(request.reviewText());
        review.setLanguage(request.reviewLanguage());
        review.setContainsSpoiler(Boolean.TRUE.equals(request.containsSpoiler()));
        review.setIsVisible(true);
        return review;
    }

    public ReviewResponse toResponse(Review review) {
        if (review == null) {
            return null;
        }

        return new ReviewResponse(
                review.getId(),
                appUserMapper.toSummaryResponse(review.getUser()),
                review.getTitle() == null ? null : review.getTitle().getId(),
                review.getTitle() == null ? null : review.getTitle().getName(),
                review.getRating(),
                review.getReviewText(),
                review.getLanguage(),
                review.getContainsSpoiler(),
                review.getIsVisible(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }

    public void updateEntity(Review review, ReviewUpdateRequest request) {
        if (review == null || request == null) {
            return;
        }

        review.setRating(request.rating());
        review.setReviewText(request.reviewText());
        review.setLanguage(request.reviewLanguage());
        review.setContainsSpoiler(Boolean.TRUE.equals(request.containsSpoiler()));
    }
}
