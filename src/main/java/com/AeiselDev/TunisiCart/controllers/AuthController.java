package com.AeiselDev.TunisiCart.controllers;

import com.AeiselDev.TunisiCart.common.*;
import com.AeiselDev.TunisiCart.security.JwtService;
import com.AeiselDev.TunisiCart.services.AuthenticationService;
import com.AeiselDev.TunisiCart.services.UserDetailsServiceImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

        private final AuthenticationService service;

        @Autowired
        private UserDetailsServiceImpl userDetailsService;
        @Autowired
        private JwtService jwtService;

        @PostMapping("/refresh-token")
        public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequest request) {
            String requestRefreshToken = request.getRefreshToken();

            try {
                if (jwtService.isTokenExpired(requestRefreshToken)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Refresh token is expired.");
                }

                String username = jwtService.extractUsername(requestRefreshToken);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                String newToken = jwtService.generateToken(userDetails);

                return ResponseEntity.ok(new TokenRefreshResponse(newToken, requestRefreshToken));
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token.");
            }
        }

//    @PostMapping("/refresh-token")
//    public void refreshToken(
//            HttpServletRequest request,
//            HttpServletResponse response
//    ) throws IOException {
//        jwtService.generateRefreshToken(request, response);
//    }


        @PostMapping("/register")
        @ResponseStatus(HttpStatus.ACCEPTED)
        public ResponseEntity<?> register(
                @RequestBody @Valid RegistrationRequest request
        ) throws MessagingException {
            service.register(request);
            return ResponseEntity.accepted().build();
        }

        @PostMapping("/authenticate")
        public ResponseEntity<AuthenticationResponse> authenticate(
                @RequestBody AuthenticationRequest request
        ) {
            return ResponseEntity.ok(service.authenticate(request));
        }

        @GetMapping("/activate-account")
        public void confirm(
                @RequestParam String token
        ) throws MessagingException {
            service.activateAccount(token);
        }


}