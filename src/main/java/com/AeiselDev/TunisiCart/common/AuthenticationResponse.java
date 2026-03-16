package com.AeiselDev.TunisiCart.common;


import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class AuthenticationResponse {
    private String accessToken;
    private String refreshToken;
    private String userId;
}