package com.AeiselDev.TunisiCart.repositories;

import com.AeiselDev.TunisiCart.entities.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByUserId(Long userId);


    // Custom method to count orders by status
    @Query("SELECT po.status, COUNT(po) FROM PurchaseOrder po GROUP BY po.status")
    Map<String, Long> countOrdersByStatus();

    // Custom method to calculate the sum of total amounts
    @Query("SELECT SUM(po.totalAmount) FROM PurchaseOrder po")
    Double sumTotalAmount();
}

