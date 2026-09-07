package com.cinenotes.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import com.cinenotes.domain.Genre;
import com.cinenotes.domain.MoodTag;
import com.cinenotes.domain.Title;
import com.cinenotes.domain.TitleGenre;
import com.cinenotes.domain.TitleMoodTag;
import com.cinenotes.dto.GenreResponse;
import com.cinenotes.dto.MoodTagResponse;
import com.cinenotes.dto.TitleRequest;
import com.cinenotes.dto.TitleResponse;
import com.cinenotes.dto.TitleSummaryResponse;

@Component
public class TitleMapper {

    public Title toEntity(TitleRequest request) {
        if (request == null) {
            return null;
        }

        Title title = new Title();
        updateEntity(title, request);
        return title;
    }

    public TitleResponse toResponse(Title title) {
        if (title == null) {
            return null;
        }

        return new TitleResponse(
                title.getId(),
                title.getTmdbId(),
                title.getType(),
                title.getName(),
                title.getOriginalName(),
                title.getOverview(),
                title.getPosterPath(),
                title.getReleaseDate(),
                title.getRuntimeMinutes(),
                title.getOriginalLanguage(),
                title.getCountry(),
                title.getTmdbVoteAverage(),
                title.getTmdbVoteCount(),
                null,
                0L,
                title.getBackdropPath(),
                toGenreResponses(title),
                toMoodTagResponses(title),
                title.getCreatedAt(),
                title.getUpdatedAt()
        );
    }

    public TitleSummaryResponse toSummaryResponse(Title title) {
        if (title == null) {
            return null;
        }

        return new TitleSummaryResponse(
                title.getId(),
                title.getTmdbId(),
                title.getType(),
                title.getName(),
                title.getPosterPath(),
                title.getReleaseDate()
        );
    }

    public void updateEntity(Title title, TitleRequest request) {
        if (title == null || request == null) {
            return;
        }

        title.setTmdbId(request.getTmdbId());
        title.setType(request.getType());
        title.setName(request.getName());
        title.setOriginalName(request.getOriginalName());
        title.setOverview(request.getOverview());
        title.setPosterPath(request.getPosterPath());
        title.setBackdropPath(request.getBackdropPath());
        title.setReleaseDate(request.getReleaseDate());
        title.setRuntimeMinutes(request.getRuntimeMinutes());
        title.setOriginalLanguage(request.getOriginalLanguage());
        title.setCountry(request.getCountry());
        title.setTmdbVoteAverage(request.getTmdbVoteAverage());
        title.setTmdbVoteCount(request.getTmdbVoteCount());
    }

    private List<GenreResponse> toGenreResponses(Title title) {
        if (title.getTitleGenres() == null) {
            return List.of();
        }

        return title.getTitleGenres()
                .stream()
                .map(TitleGenre::getGenre)
                .map(this::toGenreResponse)
                .toList();
    }

    private GenreResponse toGenreResponse(Genre genre) {
        if (genre == null) {
            return null;
        }

        return new GenreResponse(
                genre.getId(),
                genre.getTmdbGenreId(),
                genre.getName()
        );
    }

    private List<MoodTagResponse> toMoodTagResponses(Title title) {
        if (title.getTitleMoodTags() == null) {
            return List.of();
        }

        return title.getTitleMoodTags()
                .stream()
                .map(TitleMoodTag::getMoodTag)
                .map(this::toMoodTagResponse)
                .toList();
    }

    private MoodTagResponse toMoodTagResponse(MoodTag moodTag) {
        if (moodTag == null) {
            return null;
        }

        return new MoodTagResponse(
                moodTag.getId(),
                moodTag.getName(),
                moodTag.getDescription()
        );
    }
}
