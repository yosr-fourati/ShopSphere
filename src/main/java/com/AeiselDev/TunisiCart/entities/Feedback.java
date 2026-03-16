package com.AeiselDev.TunisiCart.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int rating;
    private String comment;

    @Temporal(TemporalType.DATE)
    private Date feedbackDate;


    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;
}
