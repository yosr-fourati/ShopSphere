package com.AeiselDev.TunisiCart.controllers;


import com.AeiselDev.TunisiCart.common.FeedbackRequest;
import com.AeiselDev.TunisiCart.common.FeedbackResponse;
import com.AeiselDev.TunisiCart.entities.Feedback;
import com.AeiselDev.TunisiCart.services.FeedbackService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
@Tag(name ="Feedback")
public class FeedbackController {


    private  final FeedbackService feedbackService;

    @GetMapping
    public ResponseEntity<List<FeedbackResponse>> getAllFeedback() {
        List<FeedbackResponse> feedbackList = feedbackService.getAllFeedback();
        return new ResponseEntity<>(feedbackList, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeedbackResponse> getFeedbackById(@PathVariable Long id) {
        FeedbackResponse feedback = feedbackService.getFeedbackById(id);
        if (feedback == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(feedback, HttpStatus.OK);
    }

    @PostMapping("/{ItemId}")
    public ResponseEntity<Feedback> saveFeedback(@PathVariable Long ItemId, @RequestBody FeedbackRequest feedback) {
        Feedback savedFeedback = feedbackService.saveFeedback(ItemId, feedback);
        return new ResponseEntity<>(savedFeedback, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
