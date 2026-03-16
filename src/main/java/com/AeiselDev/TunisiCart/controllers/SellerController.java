package com.AeiselDev.TunisiCart.controllers;


import com.AeiselDev.TunisiCart.common.ItemRequest;
import com.AeiselDev.TunisiCart.common.UpdateResponse;
import com.AeiselDev.TunisiCart.entities.Item;
import com.AeiselDev.TunisiCart.entities.PurchaseOrder;
import com.AeiselDev.TunisiCart.entities.User;
import com.AeiselDev.TunisiCart.services.ItemService;

import com.AeiselDev.TunisiCart.services.OrderService;
import com.AeiselDev.TunisiCart.services.ProfileService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("seller")
@Tag(name = "seller")
public class SellerController {


    private final ItemService itemService;
    private final ProfileService profileService;
    private final OrderService orderService;


    // Profile Endpoints

//    @GetMapping("/profile/{userId}")
//    public ResponseEntity<?> getProfile(@PathVariable Long userId) {
//        return ResponseEntity.ok(profileService.getProfile(userId));
//    }
//
//    @PutMapping("/profile/{userId}")
//    public ResponseEntity<?> updateProfile(@PathVariable Long userId, @RequestBody User profile) {
//        profileService.updateProfile(userId, profile);
//        return ResponseEntity.ok("Profile updated successfully");
//    }


    // Item Management Endpoints

    @GetMapping("/items")
    public ResponseEntity<?> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    @GetMapping("/item/{id}")
    public ResponseEntity<?> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    @GetMapping("/items/{UserId}")
    public ResponseEntity<List<Item>> getItemUserById(@PathVariable Long UserId) {
        return ResponseEntity.ok(itemService.getItemByUserId(UserId));
    }

    @PostMapping("/items/{UserId}")
    public ResponseEntity<?> createItem(@PathVariable Long UserId, @RequestBody ItemRequest request) {
        itemService.createItem(UserId, request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Item created successfully");
        return ResponseEntity.ok(response);
    }


    @PutMapping("/items/{ItemId}")
    public ResponseEntity<UpdateResponse> updateItem(@PathVariable Long ItemId, @RequestBody ItemRequest request) {
        itemService.updateItem(ItemId, request);
        UpdateResponse response = new UpdateResponse("Item updated successfully", true);
        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.ok("Item deleted successfully");
    }

    // Order Management Endpoints

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/orders/{id}")
    public ResponseEntity<?> updateOrder(@PathVariable Long id, @RequestBody PurchaseOrder order) {
        orderService.updateOrder(id, order);
        return ResponseEntity.ok("Order updated successfully");
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok("Order deleted successfully");
    }
}
