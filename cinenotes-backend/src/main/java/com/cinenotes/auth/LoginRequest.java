package com.cinenotes.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "usernameOrEmail is required")
    @Size(max = 255, message = "usernameOrEmail must be at most 255 characters")
    private String usernameOrEmail;

    @NotBlank(message = "password is required")
    private String password;
}
