package com.AeiselDev.TunisiCart.services;

import com.AeiselDev.TunisiCart.common.FeedbackRequest;
import com.AeiselDev.TunisiCart.common.FeedbackResponse;
import com.AeiselDev.TunisiCart.entities.Feedback;
import com.AeiselDev.TunisiCart.entities.Item;
import com.AeiselDev.TunisiCart.repositories.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ItemService itemService;


    public List<FeedbackResponse> getAllFeedback() {
        List<Feedback> feedbackList = feedbackRepository.findAll();

        return feedbackList.stream()
                .map(feedback -> new FeedbackResponse(
                        feedback.getId(),
                        feedback.getRating(),
                        feedback.getComment(),
                        feedback.getFeedbackDate()
                ))
                .collect(Collectors.toList());
    }

    public FeedbackResponse getFeedbackById(Long id) {
        Optional<Feedback> feedbackOpt = feedbackRepository.findById(id);

        if (feedbackOpt.isPresent()) {
            Feedback feedback = feedbackOpt.get();
            return new FeedbackResponse(
                    feedback.getId(),
                    feedback.getRating(),
                    feedback.getComment(),
                    feedback.getFeedbackDate()
            );
        } else {
            return null; // or throw an exception, or return an Optional<FeedbackResponse>
        }
    }

    public List<FeedbackResponse> getFeedbackByItemId(Long itemId) {
        List<Feedback> feedbackList = feedbackRepository.findByItemId(itemId);

        return feedbackList.stream()
                .map(feedback -> new FeedbackResponse(
                        feedback.getId(),
                        feedback.getRating(),
                        feedback.getComment(),
                        feedback.getFeedbackDate()
                ))
                .collect(Collectors.toList());
    }


    public Feedback saveFeedback(long Item_id,  FeedbackRequest feedbackRequest) {
        Optional<Item> itemOptional = itemService.getItemById(Item_id);
        if (itemOptional.isPresent()) {
            Item item = itemOptional.get();
            Feedback feedback = new Feedback();
            feedback.setItem(item);
            feedback.setComment(feedbackRequest.getComment());
            feedback.setFeedbackDate(new Date(System.currentTimeMillis()));
            feedback.setRating(feedbackRequest.getRating());
            return feedbackRepository.save(feedback);
        }
        return null;
    }

    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }
}
