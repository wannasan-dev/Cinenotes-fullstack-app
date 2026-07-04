package com.cinenotes.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

    private String backdropPath;

    private LocalDate releaseDate;

    private Integer runtime;

    private String originalLanguage;

    private Double tmdbVoteAverage;

    private Integer tmdbVoteCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
