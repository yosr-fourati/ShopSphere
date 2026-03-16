package com.AeiselDev.TunisiCart.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import net.minidev.json.annotate.JsonIgnore;

@Data
@Entity
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fileName;
    @Column(name = "picByte" ,columnDefinition = "LONGBLOB")
    private byte[] data; // or use a URL or path if storing files elsewhere

    @JsonBackReference
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @JsonBackReference
    @OneToOne
    @JoinColumn(name = "item_id")
    private Item item;

    // getters and setters
}