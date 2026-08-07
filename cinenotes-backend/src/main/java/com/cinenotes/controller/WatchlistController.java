package com.cinenotes.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinenotes.dto.WatchlistItemResponse;
import com.cinenotes.dto.WatchlistUpsertRequest;
import com.cinenotes.service.WatchlistService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/watchlist")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class WatchlistController {

    private final WatchlistService watchlistService;

    @PutMapping
    public WatchlistItemResponse upsert(@Valid @RequestBody WatchlistUpsertRequest request) {
        return watchlistService.upsert(request);
    }

    @DeleteMapping("/title/{titleId}")
    public ResponseEntity<Void> removeByTitleId(@PathVariable Long titleId) {
        watchlistService.removeByTitleId(titleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<WatchlistItemResponse> findCurrentUserWatchlist() {
        return watchlistService.findCurrentUserWatchlist();
    }

    @GetMapping("/title/{titleId}")
    public WatchlistItemResponse findCurrentUserWatchlistItemByTitle(@PathVariable Long titleId) {
        return watchlistService.findCurrentUserWatchlistItemByTitle(titleId);
    }
}
