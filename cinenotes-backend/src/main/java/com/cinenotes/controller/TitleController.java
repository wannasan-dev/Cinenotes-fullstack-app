package com.cinenotes.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cinenotes.domain.Genre;
import com.cinenotes.domain.TitleType;
import com.cinenotes.dto.TitleRequest;
import com.cinenotes.dto.TitleResponse;
import com.cinenotes.service.TitleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/titles")
@RequiredArgsConstructor
public class TitleController {

    private final TitleService titleService;

    @GetMapping
    public ResponseEntity<List<TitleResponse>> findAll(
            @RequestParam(required = false) TitleType type,
            @RequestParam(required = false) Genre genre,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(titleService.findAll(type, genre, keyword));
    }

    @GetMapping("/{id}")
    public TitleResponse findById(@PathVariable Long id) {
        return titleService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TitleResponse create(@Valid @RequestBody TitleRequest request) {
        return titleService.create(request);
    }

    @PutMapping("/{id}")
    public TitleResponse update(
            @PathVariable Long id, 
            @Valid @RequestBody TitleRequest request
    ) {
        return titleService.update(id, request);
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Long id) {

        titleService.delete(id);

        return ResponseEntity.noContent().build();

    }
    
  
    
}