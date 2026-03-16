package com.AeiselDev.ShopSphere.repositories;

import com.AeiselDev.ShopSphere.entities.Role;
import com.AeiselDev.ShopSphere.entities.User;
import com.AeiselDev.ShopSphere.enums.RoleType;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByRegistrationDateAfter(LocalDate date);

    List<User> findByLastLoginAfter(LocalDate date);
//    Optional<User> findById(Long id);
//
//    void deleteById(Long id);
}
