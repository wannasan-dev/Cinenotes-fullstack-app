package com.cinenotes.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cinenotes.dto.MoodTagRequest;
import com.cinenotes.dto.MoodTagResponse;
import com.cinenotes.service.MoodTagService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/mood-tags")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminMoodTagController {

    private final MoodTagService moodTagService;

    @GetMapping
    public List<MoodTagResponse> findAll() {
        return moodTagService.findAll();
    }

    @GetMapping("/{id}")
    public MoodTagResponse findById(@PathVariable Long id) {
        return moodTagService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MoodTagResponse create(@Valid @RequestBody MoodTagRequest request) {
        return moodTagService.create(request);
    }

    @PutMapping("/{id}")
    public MoodTagResponse update(
            @PathVariable Long id,
            @Valid @RequestBody MoodTagRequest request
    ) {
        return moodTagService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        moodTagService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
