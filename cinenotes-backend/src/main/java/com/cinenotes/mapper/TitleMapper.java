package com.cinenotes.mapper;

import org.springframework.stereotype.Component;

import com.cinenotes.domain.Title;
import com.cinenotes.dto.TitleRequest;
import com.cinenotes.dto.TitleResponse;

@Component
public class TitleMapper {

    public Title toEntity(TitleRequest request) {
        Title title = new Title();

        title.setType(request.getType());
        title.setName(request.getName());
        title.setGenres(request.getGenres());
        title.setRating(request.getRating());
        title.setDescription(request.getDescription());
        title.setReleaseYear(request.getReleaseYear());
        title.setPosterUrl(request.getPosterUrl());
        title.setReviewText(request.getReviewText());

        return title;
    }

    public TitleResponse toResponse(Title title) {
        return new TitleResponse(
                title.getId(),
                title.getType(),
                title.getName(),
                title.getGenres(),
                title.getRating(),
                title.getDescription(),
                title.getReleaseYear(),
                title.getPosterUrl(),
                title.getReviewText(),
                title.getCreatedAt(),
                title.getUpdatedAt()
        );
    }

    public void updateEntity(Title title, TitleRequest request) {
        title.setType(request.getType());
        title.setName(request.getName());
        title.setGenres(request.getGenres());
        title.setRating(request.getRating());
        title.setDescription(request.getDescription());
        title.setReleaseYear(request.getReleaseYear());
        title.setPosterUrl(request.getPosterUrl());
        title.setReviewText(request.getReviewText());
    }
}