package com.AeiselDev.ShopSphere.repositories;

import com.AeiselDev.ShopSphere.entities.Role;
import com.AeiselDev.ShopSphere.entities.User;
import com.AeiselDev.ShopSphere.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByRegistrationDateAfter(LocalDate date);
    List<User> findByLastLoginAfter(LocalDate date);

    @Query("SELECT u FROM User u WHERE u.role.name = :roleType AND u.accountLocked = true AND u.enabled = true")
    List<User> findPendingSellers(@Param("roleType") RoleType roleType);
}
