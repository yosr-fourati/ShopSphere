package com.AeiselDev.TunisiCart.common;

import com.AeiselDev.TunisiCart.entities.Item;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class FeedbackRequest {

    private int rating;
    private String comment;
}
