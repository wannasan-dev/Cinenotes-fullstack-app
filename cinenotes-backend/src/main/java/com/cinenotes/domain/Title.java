package com.cinenotes.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "titles",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_titles_tmdb_id_type",
                columnNames = {"tmdb_id", "type"}
        )
)
@Getter
@Setter
@NoArgsConstructor
public class Title {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tmdb_id")
    private Long tmdbId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TitleType type;

    @Column(nullable = false)
    private String name;

    @Column(name = "original_name")
    private String originalName;

    @Column(columnDefinition = "TEXT")
    private String overview;

    @Column(name = "poster_path")
    private String posterPath;

    @Column(name = "backdrop_path")
    private String backdropPath;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "runtime_minutes")
    private Integer runtimeMinutes;

    @Column(name = "original_language")
    private String originalLanguage;

    private String country;

    @Column(name = "tmdb_vote_average")
    private Double tmdbVoteAverage;

    @Column(name = "tmdb_vote_count")
    private Integer tmdbVoteCount;

    @OneToMany(mappedBy = "title")
    private Set<TitleGenre> titleGenres = new HashSet<>();

    @OneToMany(mappedBy = "title")
    private Set<TitleMoodTag> titleMoodTags = new HashSet<>();

    @OneToMany(mappedBy = "title")
    private Set<Review> reviews = new HashSet<>();

    @OneToMany(mappedBy = "title")
    private Set<WatchlistItem> watchlistItems = new HashSet<>();

    @OneToMany(mappedBy = "title")
    private Set<WatchLog> watchLogs = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
