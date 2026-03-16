package com.AeiselDev.ShopSphere.controllers;

import com.AeiselDev.ShopSphere.entities.Item;
import com.AeiselDev.ShopSphere.services.ActivityHistoryService;
import com.AeiselDev.ShopSphere.services.ItemService;
import com.AeiselDev.ShopSphere.services.PublicService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
@Tag(name = "Public")
public class PublicController {

    private final ItemService itemService;
    private final PublicService publicService;
    private final ActivityHistoryService activityHistoryService;

    @GetMapping("/items")
    public ResponseEntity<Page<Item>> getAllItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(itemService.filterItems(search, categoryId, minPrice, maxPrice, pageable));
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        return itemService.getItemById(id)
                .map(item -> {
                    activityHistoryService.recordView(id);
                    return ResponseEntity.ok(item);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/items/search")
    public ResponseEntity<Page<Item>> searchItems(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(itemService.searchItems(query, pageable));
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getAllCategories() {
        return ResponseEntity.ok(itemService.getAllCategories());
    }

    @GetMapping("/sellers")
    public ResponseEntity<?> getAllSellers() {
        return ResponseEntity.ok(publicService.getAllSellers());
    }
}
