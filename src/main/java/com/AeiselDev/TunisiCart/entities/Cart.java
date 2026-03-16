package com.AeiselDev.TunisiCart.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @JsonManagedReference
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "cart_id")
    private List<CartItem> items = new ArrayList<>();

    private Long userId; // This field must be present for the query to work


    // Other fields, getters, setters


//    public void addItem(Item item, int quantity) {
//        CartItem cartItem = items.stream()
//                .filter(ci -> ci.getItem().equals(item))
//                .findFirst()
//                .orElse(null);
//
//        if (cartItem != null) {
//            // Update quantity of existing item
//            cartItem.setQuantity(cartItem.getQuantity());
//        } else {
//            // Add new item to the cart
//            CartItem newCartItem = new CartItem();
//            newCartItem.setItem(item);
//            newCartItem.setQuantity(quantity);
//            items.add(newCartItem);
//        }
//    }


    public void updateItem(Item item, int newQuantity) {
        CartItem cartItem = items.stream()
                .filter(ci -> ci.getItem().equals(item))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        cartItem.setQuantity(newQuantity);
    }

    public void removeItem(Item item) {
        CartItem cartItem = items.stream()
                .filter(ci -> ci.getItem().equals(item))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        items.remove(cartItem);
    }


}
