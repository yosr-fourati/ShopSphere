package com.AeiselDev.TunisiCart.entities;

import com.AeiselDev.TunisiCart.enums.DeliveryStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;
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
    @JoinColumn(name = "user_id", nullable = false) // assuming a purchase order must have a user
    private User user;

    @OneToMany(mappedBy = "purchaseOrder") //cascade = CascadeType.ALL, orphanRemoval = false
    private List<Item> items;

    @Embedded
    private Address deliveryAddress;

    // Other fields like payment method, discount, etc.

}
