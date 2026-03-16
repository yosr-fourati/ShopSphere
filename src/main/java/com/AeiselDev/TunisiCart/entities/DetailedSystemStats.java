package com.AeiselDev.TunisiCart.entities;



import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetailedSystemStats {
    private int totalUsers;
    private int activeUsers;
    private int newUsers;
    private long totalOrders;
    private double totalSales;
    private double averageOrderValue;
    private Map<String, Long> orderStatusCount;
    private double averageRating;

    // Constructor, Getters, and Setters
}
