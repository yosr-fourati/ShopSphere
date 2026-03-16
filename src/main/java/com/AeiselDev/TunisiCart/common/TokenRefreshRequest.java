package com.AeiselDev.TunisiCart.common;


import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
public class TokenRefreshRequest {
    private String refreshToken;

    // Constructor with parameters
    @JsonCreator
    public TokenRefreshRequest(@JsonProperty("refreshToken") String refreshToken) {
        this.refreshToken = refreshToken;
    }
    // Getters and setters
}