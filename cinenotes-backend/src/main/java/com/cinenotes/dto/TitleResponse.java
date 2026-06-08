package com.cinenotes.dto;

import java.time.LocalDateTime;

import com.cinenotes.domain.Genre;
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

    private TitleType type;

    private String name;

    private Genre genre;

    private Double rating;

    private String description;

    private Integer releaseYear;

    private String posterUrl;

    private String recommendationText;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}