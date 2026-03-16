package com.AeiselDev.TunisiCart.repositories;

import com.AeiselDev.TunisiCart.entities.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface ImageRepository extends JpaRepository<Image,Long > {

    Optional<Image> findByItemId(Long itemId);
    Optional<Image> findByUserId(Long idUser);
}
