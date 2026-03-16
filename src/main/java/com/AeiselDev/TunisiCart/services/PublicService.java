package com.AeiselDev.TunisiCart.services;

import com.AeiselDev.TunisiCart.entities.Role;
import com.AeiselDev.TunisiCart.entities.User;
import com.AeiselDev.TunisiCart.enums.RoleType;
import com.AeiselDev.TunisiCart.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PublicService {
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PurchaseOrderRepository orderRepository;
    private final FeedbackRepository feedbackRepository;
    private final  ItemRepository itemRepository;
    private final RoleRepository roleRepository;

    // Retrieve all users
    public List<User> getAllSellers() {
        Optional<Role> role = roleRepository.findByName(RoleType.SELLER);
        return userRepository.findByRole(role.orElse(null));
    }





    // Get system statistics (e.g., user count, system health, etc.)
    public Object getSystemStats() {
        // Implement your logic to gather and return system statistics
        // Example: return some mock data for demonstration purposes
        return new Object() {
            public int getUserCount() {
                return (int) userRepository.count();
            }

            public int getCartCount() {
                return (int) cartRepository.count();
            }

            public int getOrderCount() {
                return (int) orderRepository.count();
            }


            public int getFeedbackCount() {
                return (int) feedbackRepository.count();
            }

            public int getItemCount() {
                return (int) itemRepository.count();
            }

            // Add more statistics as needed
        };
    }
}
