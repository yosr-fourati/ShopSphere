package com.AeiselDev.ShopSphere.repositories;



import com.AeiselDev.ShopSphere.entities.Role;
import com.AeiselDev.ShopSphere.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleType roleUser);
}
