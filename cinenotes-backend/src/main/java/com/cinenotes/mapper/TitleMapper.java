package com.cinenotes.mapper;

import org.springframework.stereotype.Component;

import com.cinenotes.domain.Title;
import com.cinenotes.dto.TitleRequest;
import com.cinenotes.dto.TitleResponse;

@Component
public class TitleMapper {

    public Title toEntity(TitleRequest request) {
        Title title = new Title();

        title.setTmdbId(request.getTmdbId());
        title.setType(request.getType());
        title.setName(request.getName());
        title.setOriginalName(request.getOriginalName());
        title.setOverview(request.getOverview());
        title.setPosterPath(request.getPosterPath());
        title.setBackdropPath(request.getBackdropPath());
        title.setReleaseDate(request.getReleaseDate());
        title.setRuntime(request.getRuntime());
        title.setOriginalLanguage(request.getOriginalLanguage());
        title.setTmdbVoteAverage(request.getTmdbVoteAverage());
        title.setTmdbVoteCount(request.getTmdbVoteCount());

        return title;
    }

    public TitleResponse toResponse(Title title) {
        return new TitleResponse(
                title.getId(),
                title.getTmdbId(),
                title.getType(),
                title.getName(),
                title.getOriginalName(),
                title.getOverview(),
                title.getPosterPath(),
                title.getBackdropPath(),
                title.getReleaseDate(),
                title.getRuntime(),
                title.getOriginalLanguage(),
                title.getTmdbVoteAverage(),
                title.getTmdbVoteCount(),
                title.getCreatedAt(),
                title.getUpdatedAt()
        );
    }

    public void updateEntity(Title title, TitleRequest request) {
        title.setTmdbId(request.getTmdbId());
        title.setType(request.getType());
        title.setName(request.getName());
        title.setOriginalName(request.getOriginalName());
        title.setOverview(request.getOverview());
        title.setPosterPath(request.getPosterPath());
        title.setBackdropPath(request.getBackdropPath());
        title.setReleaseDate(request.getReleaseDate());
        title.setRuntime(request.getRuntime());
        title.setOriginalLanguage(request.getOriginalLanguage());
        title.setTmdbVoteAverage(request.getTmdbVoteAverage());
        title.setTmdbVoteCount(request.getTmdbVoteCount());
    }
}
