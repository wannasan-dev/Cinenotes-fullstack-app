package com.cinenotes.tmdb;

import java.time.Duration;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriBuilder;

import com.cinenotes.exception.InvalidOperationException;
import com.cinenotes.exception.ResourceNotFoundException;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class TmdbClient {

    private final RestClient restClient;
    private final String accessToken;

    public TmdbClient(
            RestClient.Builder restClientBuilder,
            @Value("${tmdb.base-url}") String baseUrl,
            @Value("${tmdb.access-token}") String accessToken,
            @Value("${tmdb.connect-timeout-millis}") int connectTimeoutMillis,
            @Value("${tmdb.read-timeout-millis}") int readTimeoutMillis
    ) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(connectTimeoutMillis));
        requestFactory.setReadTimeout(Duration.ofMillis(readTimeoutMillis));

        this.restClient = restClientBuilder
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();
        this.accessToken = accessToken;
    }

    public TmdbPagedResponse<TmdbMovieSearchResult> searchMovies(String query, int page) {
        return getPaged(
                "/search/movie",
                query,
                page,
                new ParameterizedTypeReference<>() {
                }
        );
    }

    public TmdbPagedResponse<TmdbTvSearchResult> searchSeries(String query, int page) {
        return getPaged(
                "/search/tv",
                query,
                page,
                new ParameterizedTypeReference<>() {
                }
        );
    }

    public TmdbMovieDetails getMovieDetails(Integer tmdbId) {
        return get(uriBuilder -> uriBuilder.path("/movie/{tmdbId}").build(tmdbId),
                TmdbMovieDetails.class);
    }

    public TmdbTvDetails getSeriesDetails(Integer tmdbId) {
        return get(uriBuilder -> uriBuilder.path("/tv/{tmdbId}").build(tmdbId),
                TmdbTvDetails.class);
    }

    public TmdbPagedResponse<TmdbMovieSearchResult> popularMovies(int page) {
        return getPopular(
                "/movie/popular",
                page,
                new ParameterizedTypeReference<>() {
                }
        );
    }

    public TmdbPagedResponse<TmdbTvSearchResult> popularSeries(int page) {
        return getPopular(
                "/tv/popular",
                page,
                new ParameterizedTypeReference<>() {
                }
        );
    }

    private <T> T get(
            Function<UriBuilder, java.net.URI> uriFunction,
            Class<T> responseType
    ) {
        return execute(uriFunction, request -> request.retrieve().body(responseType));
    }

    private <T> T getPaged(
            String path,
            String query,
            int page,
            ParameterizedTypeReference<T> responseType
    ) {
        return execute(
                uriBuilder -> uriBuilder
                        .path(path)
                        .queryParam("query", query)
                        .queryParam("page", normalizePage(page))
                        .build(),
                request -> request.retrieve().body(responseType)
        );
    }

    private <T> T getPopular(
            String path,
            int page,
            ParameterizedTypeReference<T> responseType
    ) {
        return execute(
                uriBuilder -> uriBuilder
                        .path(path)
                        .queryParam("page", normalizePage(page))
                        .build(),
                request -> request.retrieve().body(responseType)
        );
    }

    private <T> T execute(
            Function<UriBuilder, java.net.URI> uriFunction,
            Function<RestClient.RequestHeadersSpec<?>, T> responseExtractor
    ) {
        ensureConfigured();
        try {
            T response = responseExtractor.apply(restClient.get()
                    .uri(uriFunction)
                    .headers(headers -> headers.setBearerAuth(accessToken)));
            if (response == null) {
                throw new InvalidOperationException("TMDb response was empty");
            }
            return response;
        } catch (RestClientResponseException ex) {
            throw mapTmdbException(ex);
        } catch (RestClientException ex) {
            log.warn("TMDb client request failed: {}", ex.getMessage());
            throw new InvalidOperationException("TMDb client request failed");
        }
    }

    private void ensureConfigured() {
        if (accessToken == null || accessToken.isBlank()) {
            throw new InvalidOperationException(
                    "TMDb access token is not configured. Set TMDB_ACCESS_TOKEN."
            );
        }
    }

    private RuntimeException mapTmdbException(RestClientResponseException ex) {
        int status = ex.getStatusCode().value();
        log.warn("TMDb HTTP request failed with status {}", status);
        return switch (ex.getStatusCode().value()) {
            case 401, 403 -> new InvalidOperationException("TMDb authentication failed");
            case 404 -> new ResourceNotFoundException("TMDb title not found");
            case 429 -> new InvalidOperationException("TMDb rate limit exceeded");
            default -> new InvalidOperationException(
                    "TMDb HTTP request failed with status " + status
            );
        };
    }

    private int normalizePage(int page) {
        return page < 1 ? 1 : page;
    }
}
