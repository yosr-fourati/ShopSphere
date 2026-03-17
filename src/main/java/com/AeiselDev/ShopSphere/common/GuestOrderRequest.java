package com.AeiselDev.ShopSphere.common;

import com.AeiselDev.ShopSphere.entities.Address;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GuestOrderRequest {

    @NotEmpty(message = "Guest name is required")
    private String guestName;

    @Email(message = "Valid email is required")
    @NotEmpty(message = "Guest email is required")
    private String guestEmail;

    @NotNull(message = "Item list is required")
    private List<Long> item_id;

    private BigDecimal totalAmount;

    private Address deliveryAddress;
}
