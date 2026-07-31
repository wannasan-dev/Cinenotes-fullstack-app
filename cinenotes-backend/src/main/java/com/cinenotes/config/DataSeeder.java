package com.cinenotes.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.cinenotes.domain.Genre;
import com.cinenotes.domain.MoodTag;
import com.cinenotes.repository.GenreRepository;
import com.cinenotes.repository.MoodTagRepository;
import com.cinenotes.user.AppRole;
import com.cinenotes.user.AppUser;
import com.cinenotes.user.AppUserRepository;


@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedDevelopmentData(
            AppUserRepository appUserRepository,
            GenreRepository genreRepository,
            MoodTagRepository moodTagRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            seedUser(
                    appUserRepository,
                    passwordEncoder,
                    "admin",
                    "admin@cinenotes.local",
                    "admin123",
                    "CineNotes Admin",
                    AppRole.ADMIN
            );

            seedUser(
                    appUserRepository,
                    passwordEncoder,
                    "demo",
                    "demo@cinenotes.local",
                    "demo123",
                    "Demo User",
                    AppRole.USER
            );

            seedGenres(genreRepository);
            seedMoodTags(moodTagRepository);
        };
    }

    private void seedUser(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            String username,
            String email,
            String password,
            String displayName,
            AppRole role
    ) {
        if (appUserRepository.existsByUsername(username)) {
            return;
        }

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setDisplayName(displayName);
        user.setPreferredLanguage("en");
        user.setRole(role);
        user.setIsActive(true);

        appUserRepository.save(user);
    }

    private void seedGenres(GenreRepository genreRepository) {
        String[] genreNames = {
                "Action",
                "Drama",
                "Comedy",
                "Romance",
                "Horror",
                "Thriller",
                "Animation",
                "Documentary"
        };

        for (String name : genreNames) {
            if (!genreRepository.existsByName(name)) {
                Genre genre = new Genre();
                genre.setName(name);
                genreRepository.save(genre);
            }
        }
    }

    private void seedMoodTags(MoodTagRepository moodTagRepository) {
        String[] moodTagNames = {
                "Comforting",
                "Funny",
                "Emotional",
                "Dark",
                "Relaxing",
                "Inspiring",
                "Romantic",
                "Mind-bending"
        };

        for (String name : moodTagNames) {
            if (!moodTagRepository.existsByName(name)) {
                MoodTag moodTag = new MoodTag();
                moodTag.setName(name);
                moodTagRepository.save(moodTag);
            }
        }
    }
}
