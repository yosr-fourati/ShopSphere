package com.AeiselDev.TunisiCart.common;

import com.AeiselDev.TunisiCart.entities.Address;
import com.AeiselDev.TunisiCart.entities.Item;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderRequest {
    private Long id;  // Optional: Use this if you are updating an existing order
    private BigDecimal totalAmount;
    private Long userId;
    private List<Long> Item_id;
    private Address deliveryAddress;

}
