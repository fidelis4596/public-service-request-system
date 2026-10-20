
package com.fidelis.public_service_request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CitizenService citizenService;

    public AuthController(CitizenService citizenService) {
        this.citizenService = citizenService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        Citizen citizen = citizenService.register(
                request.fullName(),
                request.email(),
                request.password()
        );

        return new AuthResponse(
                citizen.getId(),
                citizen.getFullName(),
                citizen.getEmail(),
                "Registration successful"
        );
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        Citizen citizen = citizenService.findByEmail(request.email());

        if (!citizenService.passwordMatches(
                request.password(), citizen.getPassword())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        return new AuthResponse(
                citizen.getId(),
                citizen.getFullName(),
                citizen.getEmail(),
                "Login successful"
        );
    }

    public record RegisterRequest(
            @NotBlank(message = "Full name is required")
            @Size(max = 100)
            String fullName,

            @NotBlank(message = "Email is required")
            @Email(message = "Enter a valid email address")
            String email,

            @NotBlank(message = "Password is required")
            @Size(min = 8, message = "Password must be at least 8 characters")
            String password
    ) {}

    public record LoginRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Enter a valid email address")
            String email,

            @NotBlank(message = "Password is required")
            String password
    ) {}

    public record AuthResponse(
            Long id,
            String fullName,
            String email,
            String message
    ) {}
}
