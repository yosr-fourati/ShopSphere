package com.AeiselDev.ShopSphere.services;

import com.AeiselDev.ShopSphere.common.ItemRequest;
import com.AeiselDev.ShopSphere.entities.Category;
import com.AeiselDev.ShopSphere.entities.Item;
import com.AeiselDev.ShopSphere.entities.User;
import com.AeiselDev.ShopSphere.exception.ItemNotFoundException;
import com.AeiselDev.ShopSphere.exception.UserNotFoundException;
import com.AeiselDev.ShopSphere.repositories.CategoryRepository;
import com.AeiselDev.ShopSphere.repositories.ItemRepository;
import com.AeiselDev.ShopSphere.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public Page<Item> getAllItems(Pageable pageable) {
        return itemRepository.findAll(pageable);
    }

    public List<Item> getItemsByIds(List<Long> itemIds) {
        return itemIds.stream()
                .map(id -> itemRepository.findById(id)
                        .orElseThrow(() -> new ItemNotFoundException("Item not found with id: " + id)))
                .toList();
    }

    public Optional<Item> getItemById(Long id) {
        return itemRepository.findById(id);
    }

    @Transactional
    public Item createItem(Long userId, ItemRequest request) {
        Category category = categoryRepository.findByName(request.getCategory())
                .orElseGet(() -> {
                    Category newCategory = new Category();
                    newCategory.setName(request.getCategory());
                    return categoryRepository.save(newCategory);
                });

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        Item item = Item.builder()
                .name(request.getName())
                .price(request.getPrice())
                .description(request.getDescription())
                .quantity(request.getQuantity())
                .category(category)
                .purchaseOrder(null)
                .user(user)
                .build();

        return itemRepository.save(item);
    }

    @Transactional
    public Item updateItem(Long itemId, ItemRequest request) {
        return itemRepository.findById(itemId)
                .map(existingItem -> {
                    existingItem.setName(request.getName());
                    existingItem.setPrice(request.getPrice());
                    existingItem.setDescription(request.getDescription());
                    existingItem.setQuantity(request.getQuantity());
                    return itemRepository.save(existingItem);
                })
                .orElseThrow(() -> new ItemNotFoundException("Item not found with id: " + itemId));
    }

    public List<Item> getItemByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        return user.getItems();
    }

    @Transactional
    public void deleteItem(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new ItemNotFoundException("Item not found with id: " + id);
        }
        itemRepository.deleteById(id);
    }

    public Page<Item> searchItems(String query, Pageable pageable) {
        return itemRepository.findByNameContainingIgnoreCase(query, pageable);
    }
}
