package com.AeiselDev.ShopSphere.services;

import com.AeiselDev.ShopSphere.entities.ActivityHistory;
import com.AeiselDev.ShopSphere.repositories.ActivityHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityHistoryService {

    private final ActivityHistoryRepository activityHistoryRepository;

    public List<ActivityHistory> getActivityHistoryByUserId(Long userId) {
        return activityHistoryRepository.findByUserId(userId);
    }

    public void recordView(Long productId) {
        ActivityHistory activity = new ActivityHistory();
        activity.setProductId(productId);
        activity.setActionType("view");
        activity.setTimestamp(LocalDateTime.now());
        activityHistoryRepository.save(activity);
    }

    public void recordPurchase(Long productId, Long userId) {
        ActivityHistory activity = new ActivityHistory();
        activity.setProductId(productId);
        activity.setUserId(userId);
        activity.setActionType("purchase");
        activity.setTimestamp(LocalDateTime.now());
        activityHistoryRepository.save(activity);
    }
}
