package com.cinenotes.tmdb;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import com.cinenotes.domain.AuditAction;
import com.cinenotes.domain.Genre;
import com.cinenotes.domain.Title;
import com.cinenotes.domain.TitleGenre;
import com.cinenotes.domain.TitleType;
import com.cinenotes.dto.TitleResponse;
import com.cinenotes.exception.DuplicateResourceException;
import com.cinenotes.exception.InvalidOperationException;
import com.cinenotes.mapper.TitleMapper;
import com.cinenotes.repository.GenreRepository;
import com.cinenotes.repository.TitleGenreRepository;
import com.cinenotes.repository.TitleRepository;
import com.cinenotes.service.AdminAuthorizationService;
import com.cinenotes.service.AuditLogService;
import com.cinenotes.user.AppUser;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TmdbService {

    private static final String TARGET_TITLE = "TITLE";
    private static final int MAX_POPULAR_IMPORT_PAGES = 5;
    private static final int MAX_SEARCH_QUERY_LENGTH = 120;

    private final TmdbClient tmdbClient;
    private final TitleRepository titleRepository;
    private final GenreRepository genreRepository;
    private final TitleGenreRepository titleGenreRepository;
    private final TitleMapper titleMapper;
    private final AdminAuthorizationService adminAuthorizationService;
    private final AuditLogService auditLogService;
    private final TransactionTemplate transactionTemplate;

    public TmdbSearchResponse searchMovies(String query, int page) {
        validateQuery(query);
        TmdbPagedResponse<TmdbMovieSearchResult> response =
                tmdbClient.searchMovies(query.trim(), page);

        return new TmdbSearchResponse(
                response.page(),
                response.totalPages(),
                response.totalResults(),
                safeList(response.results())
                        .stream()
                        .map(this::toMovieSearchResponse)
                        .toList()
        );
    }

    public TmdbSearchResponse searchSeries(String query, int page) {
        validateQuery(query);
        TmdbPagedResponse<TmdbTvSearchResult> response =
                tmdbClient.searchSeries(query.trim(), page);

        return new TmdbSearchResponse(
                response.page(),
                response.totalPages(),
                response.totalResults(),
                safeList(response.results())
                        .stream()
                        .map(this::toSeriesSearchResponse)
                        .toList()
        );
    }

    @Transactional
    public TitleResponse importMovie(Integer tmdbId) {
        AppUser actor = adminAuthorizationService.requireAdmin();
        ensureNotImported(tmdbId, TitleType.MOVIE);

        TmdbMovieDetails details = tmdbClient.getMovieDetails(tmdbId);
        Title title = toMovieTitle(details);
        return importTitle(actor, title, safeList(details.genres()));
    }

    @Transactional
    public TitleResponse importSeries(Integer tmdbId) {
        AppUser actor = adminAuthorizationService.requireAdmin();
        ensureNotImported(tmdbId, TitleType.SERIES);

        TmdbTvDetails details = tmdbClient.getSeriesDetails(tmdbId);
        Title title = toSeriesTitle(details);
        return importTitle(actor, title, safeList(details.genres()));
    }

    public TmdbImportSummaryResponse importPopular(int moviePages, int seriesPages) {
        AppUser actor = adminAuthorizationService.requireAdmin();
        int imported = 0;
        int skipped = 0;
        int failed = 0;
        List<String> failureMessages = new ArrayList<>();

        for (int page = 1; page <= normalizePageCount(moviePages); page++) {
            TmdbPagedResponse<TmdbMovieSearchResult> response = tmdbClient.popularMovies(page);
            for (TmdbMovieSearchResult result : safeList(response.results())) {
                try {
                    if (isImported(result.id(), TitleType.MOVIE)) {
                        skipped++;
                        continue;
                    }
                    TmdbMovieDetails details = tmdbClient.getMovieDetails(result.id());
                    importTitleInTransaction(
                            actor,
                            toMovieTitle(details),
                            safeList(details.genres())
                    );
                    imported++;
                } catch (RuntimeException ex) {
                    failed++;
                    failureMessages.add("Movie " + result.id() + ": " + ex.getMessage());
                }
            }
        }

        for (int page = 1; page <= normalizePageCount(seriesPages); page++) {
            TmdbPagedResponse<TmdbTvSearchResult> response = tmdbClient.popularSeries(page);
            for (TmdbTvSearchResult result : safeList(response.results())) {
                try {
                    if (isImported(result.id(), TitleType.SERIES)) {
                        skipped++;
                        continue;
                    }
                    TmdbTvDetails details = tmdbClient.getSeriesDetails(result.id());
                    importTitleInTransaction(
                            actor,
                            toSeriesTitle(details),
                            safeList(details.genres())
                    );
                    imported++;
                } catch (RuntimeException ex) {
                    failed++;
                    failureMessages.add("Series " + result.id() + ": " + ex.getMessage());
                }
            }
        }

        return new TmdbImportSummaryResponse(imported, skipped, failed, failureMessages);
    }

    private void importTitleInTransaction(
            AppUser actor,
            Title title,
            List<TmdbGenreDto> tmdbGenres
    ) {
        transactionTemplate.executeWithoutResult(status -> importTitle(actor, title, tmdbGenres));
    }

    private TitleResponse importTitle(
            AppUser actor,
            Title title,
            List<TmdbGenreDto> tmdbGenres
    ) {
        ensureNotImported(title.getTmdbId().intValue(), title.getType());
        Title savedTitle = titleRepository.save(title);

        for (TmdbGenreDto tmdbGenre : tmdbGenres) {
            Genre genre = resolveGenre(tmdbGenre);
            TitleGenre titleGenre = new TitleGenre();
            titleGenre.setTitle(savedTitle);
            titleGenre.setGenre(genre);
            titleGenreRepository.save(titleGenre);
            savedTitle.getTitleGenres().add(titleGenre);
        }

        auditLogService.log(
                actor,
                AuditAction.TITLE_IMPORTED,
                TARGET_TITLE,
                savedTitle.getId(),
                "Imported title from TMDb: " + savedTitle.getName()
        );

        return titleMapper.toResponse(savedTitle);
    }

    private Genre resolveGenre(TmdbGenreDto tmdbGenre) {
        if (tmdbGenre == null || tmdbGenre.id() == null || tmdbGenre.name() == null) {
            throw new InvalidOperationException("TMDb genre response is incomplete");
        }

        return genreRepository.findByTmdbGenreId(tmdbGenre.id())
                .or(() -> genreRepository.findByNameIgnoreCase(tmdbGenre.name()))
                .map(existingGenre -> updateTmdbGenreIdIfMissing(existingGenre, tmdbGenre.id()))
                .orElseGet(() -> createGenre(tmdbGenre));
    }

    private Genre updateTmdbGenreIdIfMissing(Genre genre, Integer tmdbGenreId) {
        if (genre.getTmdbGenreId() == null) {
            genre.setTmdbGenreId(tmdbGenreId);
            return genreRepository.save(genre);
        }
        return genre;
    }

    private Genre createGenre(TmdbGenreDto tmdbGenre) {
        Genre genre = new Genre();
        genre.setTmdbGenreId(tmdbGenre.id());
        genre.setName(tmdbGenre.name());
        return genreRepository.save(genre);
    }

    private Title toMovieTitle(TmdbMovieDetails details) {
        Title title = new Title();
        title.setTmdbId(details.id().longValue());
        title.setType(TitleType.MOVIE);
        title.setName(details.title());
        title.setOriginalName(details.originalTitle());
        title.setOverview(details.overview());
        title.setPosterPath(details.posterPath());
        title.setBackdropPath(details.backdropPath());
        title.setReleaseDate(parseDate(details.releaseDate()));
        title.setRuntimeMinutes(details.runtime());
        title.setOriginalLanguage(details.originalLanguage());
        title.setCountry(movieCountries(details));
        title.setTmdbVoteAverage(details.voteAverage());
        title.setTmdbVoteCount(details.voteCount());
        return title;
    }

    private Title toSeriesTitle(TmdbTvDetails details) {
        Title title = new Title();
        title.setTmdbId(details.id().longValue());
        title.setType(TitleType.SERIES);
        title.setName(details.name());
        title.setOriginalName(details.originalName());
        title.setOverview(details.overview());
        title.setPosterPath(details.posterPath());
        title.setBackdropPath(details.backdropPath());
        title.setReleaseDate(parseDate(details.firstAirDate()));
        title.setRuntimeMinutes(firstRuntime(details.episodeRunTime()));
        title.setOriginalLanguage(details.originalLanguage());
        title.setCountry(joinCountries(details.originCountry()));
        title.setTmdbVoteAverage(details.voteAverage());
        title.setTmdbVoteCount(details.voteCount());
        return title;
    }

    private TmdbTitleSearchResultResponse toMovieSearchResponse(TmdbMovieSearchResult result) {
        return new TmdbTitleSearchResultResponse(
                result.id(),
                TitleType.MOVIE,
                result.title(),
                result.originalTitle(),
                result.overview(),
                result.posterPath(),
                result.backdropPath(),
                result.releaseDate(),
                result.originalLanguage(),
                result.voteAverage(),
                result.voteCount(),
                isImported(result.id(), TitleType.MOVIE)
        );
    }

    private TmdbTitleSearchResultResponse toSeriesSearchResponse(TmdbTvSearchResult result) {
        return new TmdbTitleSearchResultResponse(
                result.id(),
                TitleType.SERIES,
                result.name(),
                result.originalName(),
                result.overview(),
                result.posterPath(),
                result.backdropPath(),
                result.firstAirDate(),
                result.originalLanguage(),
                result.voteAverage(),
                result.voteCount(),
                isImported(result.id(), TitleType.SERIES)
        );
    }

    private void ensureNotImported(Integer tmdbId, TitleType type) {
        if (isImported(tmdbId, type)) {
            throw new DuplicateResourceException("Title is already imported from TMDb");
        }
    }

    private boolean isImported(Integer tmdbId, TitleType type) {
        return tmdbId != null
                && titleRepository.existsByTmdbIdAndType(tmdbId.longValue(), type);
    }

    private void validateQuery(String query) {
        if (query == null || query.isBlank()) {
            throw new InvalidOperationException("TMDb search query is required");
        }
        if (query.trim().length() > MAX_SEARCH_QUERY_LENGTH) {
            throw new InvalidOperationException(
                    "TMDb search query must be " + MAX_SEARCH_QUERY_LENGTH
                            + " characters or fewer"
            );
        }
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private String joinCountries(List<String> countries) {
        if (countries == null || countries.isEmpty()) {
            return null;
        }
        return String.join(",", countries);
    }

    private String movieCountries(TmdbMovieDetails details) {
        List<String> productionCountryCodes = safeList(details.productionCountries())
                .stream()
                .map(TmdbProductionCountryDto::isoCode)
                .filter(code -> code != null && !code.isBlank())
                .toList();

        if (!productionCountryCodes.isEmpty()) {
            return joinCountries(productionCountryCodes);
        }

        return joinCountries(details.originCountry());
    }

    private Integer firstRuntime(List<Integer> runtimes) {
        if (runtimes == null) {
            return null;
        }
        return runtimes.stream()
                .filter(runtime -> runtime != null && runtime > 0)
                .findFirst()
                .orElse(null);
    }

    private int normalizePageCount(int pageCount) {
        if (pageCount < 0) {
            return 0;
        }
        return Math.min(pageCount, MAX_POPULAR_IMPORT_PAGES);
    }

    private <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : values;
    }
}
