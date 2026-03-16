package com.AeiselDev.ShopSphere.repositories;

import com.AeiselDev.ShopSphere.entities.Category;
import com.AeiselDev.ShopSphere.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
}
