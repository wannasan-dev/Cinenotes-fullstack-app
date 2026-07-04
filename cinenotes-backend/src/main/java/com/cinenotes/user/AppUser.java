package com.cinenotes.user;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.cinenotes.domain.AuditLog;
import com.cinenotes.domain.Review;
import com.cinenotes.domain.WatchLog;
import com.cinenotes.domain.WatchlistItem;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, name = "password_hash")
    private String passwordHash;

    @Column(nullable = false, unique = true)
    private String email;

    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String profileImageUrl;

    private String preferredLanguage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppRole role;

    @Column(nullable = false)
    private Boolean isActive = true;

    @OneToMany(mappedBy = "user")
    private Set<Review> reviews = new HashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<WatchlistItem> watchlistItems = new HashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<WatchLog> watchLogs = new HashSet<>();

    @OneToMany(mappedBy = "actorUser")
    private Set<AuditLog> auditLogs = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public String getPassword() {
        return passwordHash;
    }

    public void setPassword(String password) {
        this.passwordHash = password;
    }
} 
