package com.cinenotes.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cinenotes.domain.TitleType;
import com.cinenotes.dto.TitleResponse;
import com.cinenotes.service.TitleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/titles")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TitleController {

    private final TitleService titleService;

    @GetMapping
    public ResponseEntity<List<TitleResponse>> findAll(
            @RequestParam(required = false) TitleType type,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(titleService.findAll(type, genre, keyword));
    }

    @GetMapping("/{id}")
    public TitleResponse findById(@PathVariable Long id) {
        return titleService.findById(id);
    }
}
