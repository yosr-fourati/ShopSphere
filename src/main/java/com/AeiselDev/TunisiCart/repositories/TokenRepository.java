package com.AeiselDev.TunisiCart.repositories;



import com.AeiselDev.TunisiCart.entities.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {

    void deleteByUserId(int user_id);

    Optional<Token> findByToken(String token);
}