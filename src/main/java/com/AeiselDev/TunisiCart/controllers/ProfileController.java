package com.AeiselDev.TunisiCart.controllers;

import com.AeiselDev.TunisiCart.common.ProfileUpdateRequest;

import com.AeiselDev.TunisiCart.entities.User;
import com.AeiselDev.TunisiCart.exception.ApiResponse;
import com.AeiselDev.TunisiCart.exception.ProfileResponse;
import com.AeiselDev.TunisiCart.services.ProfileService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
@Tag(name ="Profile")
public class ProfileController {

    private final ProfileService profileService;


    // Profile Endpoints

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponse> getProfile(@PathVariable Long userId) {
        try {
            User profileData = profileService.getProfile(userId);

            // Build a successful response
            ProfileResponse response = ProfileResponse.builder()
                    .message("Profile fetched successfully")
                    .success(true)
                    .data(profileData)
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Build an error response
            ProfileResponse errorResponse = ProfileResponse.builder()
                    .message("Failed to fetch profile")
                    .success(false)
                    .data(null)
                    .build();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }


    @PutMapping("/{userId}")
    public void updateProfile(@PathVariable Long userId, @RequestBody ProfileUpdateRequest profile) {
        profileService.updateProfile(userId, profile);

    }

}
