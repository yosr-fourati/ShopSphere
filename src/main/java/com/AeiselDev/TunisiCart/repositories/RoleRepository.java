package com.AeiselDev.TunisiCart.repositories;



import com.AeiselDev.TunisiCart.entities.Role;
import com.AeiselDev.TunisiCart.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleType roleUser);
}
