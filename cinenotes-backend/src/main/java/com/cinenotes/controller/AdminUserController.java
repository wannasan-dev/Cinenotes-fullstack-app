package com.cinenotes.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinenotes.dto.UpdateUserRoleRequest;
import com.cinenotes.dto.UserAdminResponse;
import com.cinenotes.service.AdminUserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public List<UserAdminResponse> findAll() {
        return adminUserService.findAll();
    }

    @GetMapping("/{id}")
    public UserAdminResponse findById(@PathVariable Long id) {
        return adminUserService.findById(id);
    }

    @PatchMapping("/{id}/role")
    public UserAdminResponse updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request
    ) {
        return adminUserService.updateRole(id, request);
    }

    @PatchMapping("/{id}/activate")
    public UserAdminResponse activate(@PathVariable Long id) {
        return adminUserService.activate(id);
    }

    @PatchMapping("/{id}/deactivate")
    public UserAdminResponse deactivate(@PathVariable Long id) {
        return adminUserService.deactivate(id);
    }
}
