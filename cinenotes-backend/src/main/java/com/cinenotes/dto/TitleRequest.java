package com.cinenotes.dto;

import java.time.LocalDate;
import java.util.List;

import com.cinenotes.domain.TitleType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TitleRequest {

    private Long tmdbId;

    @NotNull(message = "type is required")
    private TitleType type;

    @NotBlank(message = "name is required")
    @Size(max = 255, message = "name must be at most 255 characters")
    private String name;

    @Size(max = 255, message = "originalName must be at most 255 characters")
    private String originalName;

    private String overview;

    @Size(max = 1000, message = "posterPath must be at most 1000 characters")
    private String posterPath;

    private LocalDate releaseDate;

    @Min(value = 1, message = "runtimeMinutes must be positive")
    private Integer runtimeMinutes;

    @Size(max = 20, message = "originalLanguage must be at most 20 characters")
    private String originalLanguage;

    @Size(max = 100, message = "country must be at most 100 characters")
    private String country;

    @DecimalMin(value = "0.0", message = "tmdbVoteAverage must be at least 0")
    @DecimalMax(value = "10.0", message = "tmdbVoteAverage must be at most 10")
    private Double tmdbVoteAverage;

    @Min(value = 0, message = "tmdbVoteCount must be at least 0")
    private Integer tmdbVoteCount;

    @Size(max = 1000, message = "backdropPath must be at most 1000 characters")
    private String backdropPath;

    private List<Long> genreIds;

    private List<Long> moodTagIds;
}
