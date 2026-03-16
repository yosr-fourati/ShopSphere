package com.AeiselDev.TunisiCart.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemRequest {
    private Long sellerId;
    private String name;
    private BigDecimal price;
    private String description;
    private Integer quantity;
    private String category;
}

