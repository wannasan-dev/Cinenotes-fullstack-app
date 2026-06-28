package com.cinenotes.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {

    private String username;
    private String role;
    private String token;
    private String message;
}
