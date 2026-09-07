package com.cinenotes.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.cinenotes.dto.MoodTagResponse;
import com.cinenotes.service.MoodTagService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mood-tags")
@RequiredArgsConstructor
@CrossOrigin(
        origins = "http://localhost:5173",
        methods = RequestMethod.GET,
        allowedHeaders = {"Authorization", "Content-Type"}
)
public class MoodTagController {

    private final MoodTagService moodTagService;

    @GetMapping
    public List<MoodTagResponse> findAll() {
        return moodTagService.findAll();
    }
}
