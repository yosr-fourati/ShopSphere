package com.AeiselDev.TunisiCart.exception;

import com.AeiselDev.TunisiCart.entities.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileResponse {
    private String message;
    private boolean success;
    private User data;

}
