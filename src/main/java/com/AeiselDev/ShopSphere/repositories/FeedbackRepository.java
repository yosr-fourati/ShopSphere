package com.AeiselDev.ShopSphere.repositories;

import com.AeiselDev.ShopSphere.entities.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByItemId(Long itemId);

    // Custom method to calculate the average rating
    @Query("SELECT AVG(f.rating) FROM Feedback f")
    double findAverageRating();}
