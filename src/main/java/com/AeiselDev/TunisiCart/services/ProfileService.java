package com.AeiselDev.TunisiCart.services;

import com.AeiselDev.TunisiCart.common.ProfileUpdateRequest;
import com.AeiselDev.TunisiCart.entities.User;
import com.AeiselDev.TunisiCart.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void updateProfile(Long userId, ProfileUpdateRequest profile) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update the user's details
        existingUser.setFirstName(profile.getFirstName());
        existingUser.setLastName(profile.getLastName());
        existingUser.setEmail(profile.getEmail());
        existingUser.setPassword(passwordEncoder.encode(profile.getPassword()));

        // Update other fields as needed

        userRepository.save(existingUser);

    }

    public User getProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
