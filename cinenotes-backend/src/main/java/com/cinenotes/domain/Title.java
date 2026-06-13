package com.cinenotes.domain;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
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
    
	@ElementCollection
	@Enumerated(EnumType.STRING)
	@CollectionTable(name = "title_genres", joinColumns = @JoinColumn(name = "title_id"))
	@Column(name = "genre")
	@Setter
	private Set<Genre> genres = new HashSet<>();
    
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
    private String reviewText;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public Title(
            TitleType type,
            String name,
            Set<Genre> genres,
            Double rating,
            String description,
            Integer releaseYear,
            String posterUrl,
            String reviewText
    ) {
        this.type = type;
        this.name = name;
        this.genres = genres;
        this.rating = rating;
        this.description = description;
        this.releaseYear = releaseYear;
        this.posterUrl = posterUrl;
        this.reviewText = reviewText;
    }
}
