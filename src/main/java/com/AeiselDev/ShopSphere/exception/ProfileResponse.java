package com.AeiselDev.ShopSphere.exception;

import com.AeiselDev.ShopSphere.entities.User;
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
