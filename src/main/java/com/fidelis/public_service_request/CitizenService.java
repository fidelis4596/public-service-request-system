
package com.fidelis.public_service_request;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CitizenService {

    private final CitizenRepository citizenRepository;
    private final PasswordEncoder passwordEncoder;

    public CitizenService(
            CitizenRepository citizenRepository,
            PasswordEncoder passwordEncoder) {
        this.citizenRepository = citizenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Citizen register(String fullName, String email, String password) {
        String normalizedEmail = email.trim().toLowerCase();

        if (citizenRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An account with this email already exists"
            );
        }

        Citizen citizen = new Citizen();
        citizen.setFullName(fullName.trim());
        citizen.setEmail(normalizedEmail);
        citizen.setPassword(passwordEncoder.encode(password));

        return citizenRepository.save(citizen);
    }

    public Citizen findByEmail(String email) {
        return citizenRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"
                ));
    }

    public boolean passwordMatches(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
