package com.cinenotes.domain;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "titles")
@Getter
@NoArgsConstructor
public class Title {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
	@Setter
    @Enumerated(EnumType.STRING)
    private TitleType type;
    
	@Setter
    private String name;
    
	@Setter
    @Enumerated(EnumType.STRING)
    private Genre genre;
    
	@Setter
    private Double rating;
    
	@Setter
    private String description;
    
	@Setter
    private Integer releaseYear;
    
	@Setter
    @Column(length = 1000)
    private String posterUrl;

	@Setter
    @Column(columnDefinition = "TEXT")
    private String recommendationText;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public Title(
            TitleType type,
            String name,
            Genre genre,
            Double rating,
            String description,
            Integer releaseYear,
            String posterUrl,
            String recommendationText
    ) {
        this.type = type;
        this.name = name;
        this.genre = genre;
        this.rating = rating;
        this.description = description;
        this.releaseYear = releaseYear;
        this.posterUrl = posterUrl;
        this.recommendationText = recommendationText;
    }
}
