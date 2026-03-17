package com.AeiselDev.ShopSphere.services;

import com.AeiselDev.ShopSphere.common.GuestOrderRequest;
import com.AeiselDev.ShopSphere.common.OrderRequest;
import com.AeiselDev.ShopSphere.entities.Item;
import com.AeiselDev.ShopSphere.entities.PurchaseOrder;
import com.AeiselDev.ShopSphere.entities.Role;
import com.AeiselDev.ShopSphere.entities.User;
import com.AeiselDev.ShopSphere.enums.DeliveryStatus;
import com.AeiselDev.ShopSphere.enums.RoleType;
import com.AeiselDev.ShopSphere.repositories.PurchaseOrderRepository;
import com.AeiselDev.ShopSphere.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import static java.time.temporal.TemporalQueries.localDate;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final ItemService itemService;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserRepository userRepository;

    public List<PurchaseOrder> getAllOrders() {
        return purchaseOrderRepository.findAll();
    }

    public PurchaseOrder getOrderById(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public void updateOrder(Long id, PurchaseOrder order) {
        PurchaseOrder existingOrder = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        // Assuming we copy the relevant fields from order to existingOrder
        existingOrder.setItems(order.getItems());
        existingOrder.setTotalAmount(order.getTotalAmount());
        // Add any other fields that need updating
        purchaseOrderRepository.save(existingOrder);
    }

    public void deleteOrder(Long id) {
        if (!purchaseOrderRepository.existsById(id)) {
            throw new RuntimeException("Order not found");
        }
        purchaseOrderRepository.deleteById(id);
    }

    public void placeOrder(OrderRequest Request) {
        Optional<User> user = userRepository.findById(Request.getUserId());
        if(user.isPresent()) {
            User userEntity = user.get();


            // Validate order, e.g., check stock levels, calculate totals, etc.
            PurchaseOrder order = new PurchaseOrder();
            List<Item> Items = itemService.getItemsByIds(Request.getItem_id());
            order.setItems(Items);
            order.setTotalAmount(Request.getTotalAmount());
            order.setStatus(DeliveryStatus.valueOf("PENDING"));
            order.setDeliveryAddress(Request.getDeliveryAddress());
            order.setOrderDate(new Date(System.currentTimeMillis()));
            order.setUser(userEntity);
            purchaseOrderRepository.save(order);

        }
    }

    public void placeGuestOrder(GuestOrderRequest request) {
        List<Item> items = itemService.getItemsByIds(request.getItem_id());
        PurchaseOrder order = new PurchaseOrder();
        order.setItems(items);
        order.setTotalAmount(request.getTotalAmount());
        order.setStatus(DeliveryStatus.PENDING);
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setOrderDate(new Date(System.currentTimeMillis()));
        order.setGuestEmail(request.getGuestEmail());
        order.setGuestName(request.getGuestName());
        order.setUser(null); // no user account for guest orders
        purchaseOrderRepository.save(order);
    }

    public List<PurchaseOrder> getOrderHistory(Long userId) {
        return purchaseOrderRepository.findByUserId(userId);
    }

    public void updateOrderStatus(Long id, String status) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(DeliveryStatus.valueOf(status));
        purchaseOrderRepository.save(order);
    }
}
