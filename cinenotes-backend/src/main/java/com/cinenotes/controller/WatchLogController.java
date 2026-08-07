package com.cinenotes.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cinenotes.dto.WatchLogCreateRequest;
import com.cinenotes.dto.WatchLogResponse;
import com.cinenotes.dto.WatchLogUpdateRequest;
import com.cinenotes.service.WatchLogService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/watch-logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class WatchLogController {

    private final WatchLogService watchLogService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WatchLogResponse create(@Valid @RequestBody WatchLogCreateRequest request) {
        return watchLogService.create(request);
    }

    @PatchMapping("/{id}")
    public WatchLogResponse updateOwnWatchLog(
            @PathVariable Long id,
            @Valid @RequestBody WatchLogUpdateRequest request
    ) {
        return watchLogService.updateOwnWatchLog(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOwnWatchLog(@PathVariable Long id) {
        watchLogService.deleteOwnWatchLog(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public WatchLogResponse findByIdForCurrentUser(@PathVariable Long id) {
        return watchLogService.findByIdForCurrentUser(id);
    }

    @GetMapping
    public List<WatchLogResponse> findCurrentUserWatchLogs() {
        return watchLogService.findCurrentUserWatchLogs();
    }

    @GetMapping("/title/{titleId}")
    public List<WatchLogResponse> findCurrentUserWatchLogsByTitle(@PathVariable Long titleId) {
        return watchLogService.findCurrentUserWatchLogsByTitle(titleId);
    }
}
