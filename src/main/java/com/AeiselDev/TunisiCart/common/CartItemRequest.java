package com.AeiselDev.TunisiCart.common;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CartItemRequest {
    private Long itemId;
    private int quantity;
}
