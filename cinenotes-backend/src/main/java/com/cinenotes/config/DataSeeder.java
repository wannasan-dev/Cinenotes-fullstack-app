package com.cinenotes.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.cinenotes.user.AppRole;
import com.cinenotes.user.AppUser;
import com.cinenotes.user.AppUserRepository;


@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner createAdminUser(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            boolean adminExists = appUserRepository.findByUsername("admin").isPresent();

            if (!adminExists) {
                AppUser admin = new AppUser();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(AppRole.ADMIN);

                appUserRepository.save(admin);
            }
            
        };
    }
}