package com.cinenotes.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinenotes.dto.UserProfileResponse;
import com.cinenotes.exception.DuplicateResourceException;
import com.cinenotes.exception.ForbiddenOperationException;
import com.cinenotes.exception.InactiveAccountException;
import com.cinenotes.mapper.AppUserMapper;
import com.cinenotes.user.AppRole;
import com.cinenotes.user.AppUser;
import com.cinenotes.user.AppUserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String TOKEN_TYPE = "Bearer";

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AppUserMapper appUserMapper;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (appUserRepository.existsByUsernameIgnoreCase(request.username())) {
            throw new DuplicateResourceException("Username already exists");
        }

        if (appUserRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("Email already exists");
        }

        AppUser user = new AppUser();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.displayName());
        user.setRole(AppRole.USER);
        user.setIsActive(true);

        AppUser savedUser = appUserRepository.save(user);
        return toAuthResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        AppUser user = appUserRepository.findByUsernameIgnoreCase(request.getUsernameOrEmail())
                .or(() -> appUserRepository.findByEmailIgnoreCase(request.getUsernameOrEmail()))
                .orElseThrow(() -> new ForbiddenOperationException("Invalid username or password"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new InactiveAccountException("Account is inactive");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ForbiddenOperationException("Invalid username or password");
        }

        return toAuthResponse(user);
    }

    private AuthResponse toAuthResponse(AppUser user) {
        String token = jwtService.createToken(user);
        UserProfileResponse userResponse = appUserMapper.toProfileResponse(user);

        return new AuthResponse(
                token,
                TOKEN_TYPE,
                jwtService.getExpirationSeconds(),
                userResponse
        );
    }
}
