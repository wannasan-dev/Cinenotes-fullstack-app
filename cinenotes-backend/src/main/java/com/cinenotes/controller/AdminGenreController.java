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

import com.cinenotes.dto.GenreRequest;
import com.cinenotes.dto.GenreResponse;
import com.cinenotes.service.GenreService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/genres")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminGenreController {

    private final GenreService genreService;

    @GetMapping
    public List<GenreResponse> findAll() {
        return genreService.findAll();
    }

    @GetMapping("/{id}")
    public GenreResponse findById(@PathVariable Long id) {
        return genreService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GenreResponse create(@Valid @RequestBody GenreRequest request) {
        return genreService.create(request);
    }

    @PutMapping("/{id}")
    public GenreResponse update(
            @PathVariable Long id,
            @Valid @RequestBody GenreRequest request
    ) {
        return genreService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        genreService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
