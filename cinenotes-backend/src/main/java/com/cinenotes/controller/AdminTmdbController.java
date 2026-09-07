package com.cinenotes.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cinenotes.dto.TitleResponse;
import com.cinenotes.tmdb.TmdbImportSummaryResponse;
import com.cinenotes.tmdb.TmdbSearchResponse;
import com.cinenotes.tmdb.TmdbService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/tmdb")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminTmdbController {

    private final TmdbService tmdbService;

    @GetMapping("/search/movies")
    public TmdbSearchResponse searchMovies(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page
    ) {
        return tmdbService.searchMovies(query, page);
    }

    @GetMapping("/search/series")
    public TmdbSearchResponse searchSeries(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page
    ) {
        return tmdbService.searchSeries(query, page);
    }

    @PostMapping("/import/movie/{tmdbId}")
    @ResponseStatus(HttpStatus.CREATED)
    public TitleResponse importMovie(@PathVariable Integer tmdbId) {
        return tmdbService.importMovie(tmdbId);
    }

    @PostMapping("/import/series/{tmdbId}")
    @ResponseStatus(HttpStatus.CREATED)
    public TitleResponse importSeries(@PathVariable Integer tmdbId) {
        return tmdbService.importSeries(tmdbId);
    }

    @PostMapping("/import/popular")
    public TmdbImportSummaryResponse importPopular(
            @RequestParam(defaultValue = "2") int moviePages,
            @RequestParam(defaultValue = "1") int seriesPages
    ) {
        return tmdbService.importPopular(moviePages, seriesPages);
    }
}
