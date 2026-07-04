package com.cinenotes.dto;

import java.time.LocalDate;

import com.cinenotes.domain.TitleType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    private String name;

    private String originalName;

    private String overview;

    private String posterPath;

    private String backdropPath;

    private LocalDate releaseDate;

    @Min(value = 1, message = "runtime must be positive")
    private Integer runtime;

    private String originalLanguage;

    @DecimalMin(value = "0.0", message = "tmdbVoteAverage must be at least 0")
    private Double tmdbVoteAverage;

    @Min(value = 0, message = "tmdbVoteCount must be at least 0")
    private Integer tmdbVoteCount;
}
