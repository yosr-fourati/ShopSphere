package com.AeiselDev.TunisiCart.controllers;


import com.AeiselDev.TunisiCart.common.CartItemRequest;
import com.AeiselDev.TunisiCart.common.FeedbackRequest;
import com.AeiselDev.TunisiCart.common.FeedbackResponse;
import com.AeiselDev.TunisiCart.common.OrderRequest;
import com.AeiselDev.TunisiCart.entities.ActivityHistory;
import com.AeiselDev.TunisiCart.entities.Feedback;
import com.AeiselDev.TunisiCart.exception.ItemNotFoundException;
import com.AeiselDev.TunisiCart.exception.UserNotFoundException;
import com.AeiselDev.TunisiCart.repositories.ActivityHistoryRepository;
import com.AeiselDev.TunisiCart.services.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("user")
@Tag(name = "user")
public class UserController {

    private final CartService cartService;
    private final OrderService orderService;
    private final ItemService itemService;
    private final FeedbackService feedbackService;

    private final ActivityHistoryService activityHistoryService;
    private final ActivityHistoryRepository activityHistoryRepository;


    // Profile Endpoints
//
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

    // Cart Endpoints

    @GetMapping("/cart/{UserId}")
    public ResponseEntity<?> getCart(@PathVariable Long UserId) {
        return ResponseEntity.ok(cartService.getCart(UserId));
    }

    @DeleteMapping("/cart/{userId}")
    public ResponseEntity<?> deleteCart(@PathVariable Long userId) {
        boolean isDeleted = cartService.deleteCart(userId);
        if (isDeleted) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cart not found or could not be deleted.");
        }
    }

    @PostMapping("/cart/items/{userId}")
    public ResponseEntity<?> addItemToCart(@PathVariable Long userId, @RequestBody CartItemRequest cartItemRequest) {
        try {
            cartService.addItemToCart(userId, cartItemRequest.getItemId(), cartItemRequest.getQuantity());
            return ResponseEntity.ok(Map.of("message", "Item added to cart"));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        } catch (ItemNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Item not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An error occurred"));
        }
    }


    @PutMapping("/cart/items/{id}")
    public ResponseEntity<?> updateCartItem(@PathVariable Long id, @RequestBody CartItemRequest cartItemRequest) {
        cartService.updateCartItem(id, cartItemRequest.getItemId(), cartItemRequest.getQuantity());
        return ResponseEntity.ok("Cart item updated");
    }

    @DeleteMapping("/cart/items/{CartItem_id}")
    public ResponseEntity<Map<String, String>> removeItemFromCart(@PathVariable Long CartItem_id) {
        cartService.removeItemFromCart(CartItem_id);

        // Create a response map with a success message
        Map<String, String> response = new HashMap<>();
        response.put("message", "Item removed from cart");

        return ResponseEntity.ok(response);
    }


    // Orders Endpoints

    @PostMapping("/orders")
    public ResponseEntity<Map<String, Object>> placeOrder(@RequestBody OrderRequest request) {
        try {
            orderService.placeOrder(request);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Order placed successfully");
            // Record the activity history for each item
            if (request.getItem_id() != null) {
                for (Long itemId : request.getItem_id()) {
                    ActivityHistory activity = new ActivityHistory();
                    activity.setProductId(itemId);
                    activity.setActionType("purchase"); // Changed to "purchase"
                    activity.setUserId(request.getUserId());
                    // Optionally set timestamp if not handled by @PrePersist
                    activity.setTimestamp(LocalDateTime.now());

                    activityHistoryRepository.save(activity);
                }
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Failed to place order");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }


    @GetMapping("/orders/history/{userId}")
    public ResponseEntity<?> getOrderHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrderHistory(userId));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    // Item Browsing Endpoints

    @GetMapping("/items")
    public ResponseEntity<?> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<?> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    @GetMapping("/items/search")
    public ResponseEntity<?> searchItems(@RequestParam String query) {
        return ResponseEntity.ok(itemService.searchItems(query));
    }


    @PostMapping("/items/{itemId}/feedback")
    public ResponseEntity<Feedback> saveFeedbackForItem(@PathVariable Long itemId, @RequestBody FeedbackRequest feedbackRequest) {
        Feedback savedFeedback = feedbackService.saveFeedback(itemId, feedbackRequest);
        return new ResponseEntity<>(savedFeedback, HttpStatus.CREATED);
    }

    @GetMapping("/items/{itemId}/feedback")
    public ResponseEntity<List<FeedbackResponse>> getFeedbackByItemId(@PathVariable Long itemId) {
        List<FeedbackResponse> feedbackList = feedbackService.getFeedbackByItemId(itemId);
        if (feedbackList.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(feedbackList, HttpStatus.OK);
    }

    @DeleteMapping("/items/{itemId}/feedback")
    public ResponseEntity<Void> deleteItemFeedback(@PathVariable Long itemId) {
        feedbackService.deleteFeedback(itemId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Activities history Endpoints

    @GetMapping("/activities/{userId}")
    public ResponseEntity<List<ActivityHistory>> getActivityHistoryByUserId(@PathVariable Long userId) {
        List<ActivityHistory> activities = activityHistoryService.getActivityHistoryByUserId(userId);
        if (activities.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(activities);
        }
        return ResponseEntity.ok(activities);
    }

}
