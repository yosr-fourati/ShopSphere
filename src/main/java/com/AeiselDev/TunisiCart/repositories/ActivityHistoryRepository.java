package com.AeiselDev.TunisiCart.repositories;

import com.AeiselDev.TunisiCart.entities.ActivityHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityHistoryRepository extends JpaRepository<ActivityHistory, Long> {

    // Fetch activity history by product ID
    List<ActivityHistory> findByProductId(Long productId);

    List<ActivityHistory> findByUserId(Long userId);
}
