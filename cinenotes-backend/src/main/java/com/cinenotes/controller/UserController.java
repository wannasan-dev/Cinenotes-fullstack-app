package com.cinenotes.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinenotes.dto.UpdateProfileRequest;
import com.cinenotes.dto.UserProfileResponse;
import com.cinenotes.dto.UserSummaryResponse;
import com.cinenotes.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserProfileResponse getCurrentUserProfile() {
        return userService.getCurrentUserProfile();
    }

    @PatchMapping("/me")
    public UserProfileResponse updateCurrentUserProfile(
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return userService.updateCurrentUserProfile(request);
    }

    @GetMapping("/{id}")
    public UserSummaryResponse getPublicUserSummaryById(@PathVariable Long id) {
        return userService.getPublicUserSummaryById(id);
    }

    @GetMapping("/by-username/{username}")
    public UserSummaryResponse getPublicUserSummaryByUsername(@PathVariable String username) {
        return userService.getPublicUserSummaryByUsername(username);
    }
}
