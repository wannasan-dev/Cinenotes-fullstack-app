package com.cinenotes.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cinenotes.dto.TitleRequest;
import com.cinenotes.dto.TitleResponse;
import com.cinenotes.service.TitleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/titles")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminTitleController {

    private final TitleService titleService;

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
