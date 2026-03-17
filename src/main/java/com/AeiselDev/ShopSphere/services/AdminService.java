package com.AeiselDev.ShopSphere.services;

import com.AeiselDev.ShopSphere.entities.DetailedSystemStats;
import com.AeiselDev.ShopSphere.entities.User;
import com.AeiselDev.ShopSphere.enums.RoleType;
import com.AeiselDev.ShopSphere.entities.ActivityHistory;
import com.AeiselDev.ShopSphere.entities.Item;
import com.AeiselDev.ShopSphere.entities.PurchaseOrder;
import com.AeiselDev.ShopSphere.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PurchaseOrderRepository orderRepository;
    private final FeedbackRepository feedbackRepository;
    private final TokenRepository tokenRepository;
    private final ActivityHistoryRepository activityHistoryRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ItemRepository itemRepository;

    // Retrieve all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Retrieve a user by ID
    public User getUserById(Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            return user.get();
        } else {
            throw new RuntimeException("User not found with ID: " + id);
        }
    }

    // Update user information
    public void updateUser(Long id, User user) {
        if (userRepository.existsById(id)) {
            user.setId(id); // Ensure the user ID is set for the update
            userRepository.save(user);
        } else {
            throw new RuntimeException("User not found with ID: " + id);
        }
    }

    // Delete a user by ID — cleans up all related records first
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with ID: " + id);
        }
        // 1. Delete activation tokens
        tokenRepository.deleteByUserId(id.intValue());
        // 2. Delete activity history
        activityHistoryRepository.deleteByUserId(id);
        // 3. Nullify purchase orders (keep order history, remove user reference)
        List<PurchaseOrder> orders = orderRepository.findByUserId(id);
        orders.forEach(o -> o.setUser(null));
        orderRepository.saveAll(orders);
        // 4. Delete cart items that reference this user's products (other users' carts)
        List<Item> items = itemRepository.findByUser_Id(id);
        if (!items.isEmpty()) {
            List<Long> itemIds = items.stream().map(Item::getId).collect(Collectors.toList());
            cartItemRepository.deleteByItemIdIn(itemIds);
        }
        // 5. Delete items owned by this user (feedbacks/images cascade automatically)
        itemRepository.deleteAll(items);
        // 6. Delete the user's own cart (cascades to their cart items)
        cartRepository.findByUserId(id).ifPresent(cartRepository::delete);
        // 6. Delete the user
        userRepository.deleteById(id);
    }

    // Get pending sellers awaiting admin approval
    public List<User> getPendingSellers() {
        return userRepository.findPendingSellers(RoleType.SELLER);
    }

    // Approve a seller: unlock account so they can log in
    public void approveSeller(Long id) {
        User user = getUserById(id);
        user.setAccountLocked(false);
        userRepository.save(user);
    }

    // Reject a seller: delete the account
    public void rejectSeller(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
        } else {
            throw new RuntimeException("User not found with ID: " + id);
        }
    }

    // Get system statistics (e.g., user count, system health, etc.)
    public DetailedSystemStats getSystemStats() {
        int totalUsers = (int) userRepository.count();
        int activeUsers = (int) userRepository.findByLastLoginAfter(LocalDate.now().minusMonths(1)).size();
        int newUsers = (int) userRepository.findByRegistrationDateAfter(LocalDate.now().minusWeeks(1)).size();

        long totalOrders = orderRepository.count();
        double totalSales = orderRepository.sumTotalAmount();
        double averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
        Map<String, Long> orderStatusCount = orderRepository.countOrdersByStatus();

        // Remove null keys
        Map<String, Long> cleanedOrderStatusCount = orderStatusCount.entrySet().stream()
                .filter(entry -> entry.getKey() != null)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));


        double averageRating = feedbackRepository.findAverageRating();

         DetailedSystemStats stats = new DetailedSystemStats(
                 totalUsers,
                 activeUsers,
                 newUsers,
                 totalOrders,
                 totalSales,
                 averageOrderValue,
                 cleanedOrderStatusCount,
                 averageRating
        );
        return stats;
    }
}
