package com.cinenotes.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.cinenotes.domain.TitleType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TitleResponse {

    private Long id;

    private Long tmdbId;

    private TitleType type;

    private String name;

    private String originalName;

    private String overview;

    private String posterPath;

    private LocalDate releaseDate;

    private Integer runtimeMinutes;

    private String originalLanguage;

    private String country;

    private Double tmdbVoteAverage;

    private Integer tmdbVoteCount;

    private String backdropPath;

    private List<GenreResponse> genres;

    private List<MoodTagResponse> moodTags;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
