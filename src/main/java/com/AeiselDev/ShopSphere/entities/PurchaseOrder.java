package com.AeiselDev.ShopSphere.entities;

import com.AeiselDev.ShopSphere.enums.DeliveryStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Temporal(TemporalType.TIMESTAMP)
    private Date orderDate;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;

    private BigDecimal totalAmount;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true) // nullable to support guest orders
    private User user;

    // Guest order fields (null for authenticated users)
    private String guestEmail;
    private String guestName;

    @OneToMany(mappedBy = "purchaseOrder") //cascade = CascadeType.ALL, orphanRemoval = false
    private List<Item> items;

    @Embedded
    private Address deliveryAddress;

    // Other fields like payment method, discount, etc.

    @JsonProperty("userEmail")
    public String getUserEmail() {
        return user != null ? user.getEmail() : null;
    }

    @JsonProperty("userName")
    public String getUserName() {
        return user != null ? user.getFullName() : null;
    }
}
