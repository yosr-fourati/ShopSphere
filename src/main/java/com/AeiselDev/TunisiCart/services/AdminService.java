package com.AeiselDev.TunisiCart.services;

import com.AeiselDev.TunisiCart.entities.DetailedSystemStats;
import com.AeiselDev.TunisiCart.entities.User;
import com.AeiselDev.TunisiCart.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

    // Delete a user by ID
    public void deleteUser(Long id) {
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
