package com.AeiselDev.TunisiCart.services;

import com.AeiselDev.TunisiCart.common.ItemRequest;
import com.AeiselDev.TunisiCart.entities.Category;
import com.AeiselDev.TunisiCart.entities.Item;
import com.AeiselDev.TunisiCart.entities.User;
import com.AeiselDev.TunisiCart.repositories.CategoryRepository;
import com.AeiselDev.TunisiCart.repositories.ItemRepository;
import com.AeiselDev.TunisiCart.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    public List<Item> getItemsByIds(List<Long> itemIds) {
        List<Item> items = new ArrayList<>();
        for (Long id : itemIds) {
            Optional<Item> item = getItemById(id);
            // Unwrap the Optional and add the item to the list
            item.ifPresent(items::add);
        }
        return items;
    }


    public Optional<Item> getItemById(Long id) {
        return itemRepository.findById(id);
    }

    public Item createItem(Long id, ItemRequest request) {
        Optional<Category> category = categoryRepository.findByName(request.getCategory());
        Category category1 ;
        if (category.isPresent()) {
            category1 = category.get();
        }else {
            category1 = new Category();
            category1.setName(request.getCategory());
            categoryRepository.save(category1);

        }



        // Find the user by id
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User not found with id: " + id);
        }
        User user = optionalUser.get(); // Retrieve the User from the Optional

        // Create and save the item
        Item item = Item.builder()
                .name(request.getName())
                .price(request.getPrice())
                .description(request.getDescription())
                .quantity(request.getQuantity())
                .category(category1)
                .purchaseOrder(null)
                .user(user)
                .build();
        itemRepository.save(item);
        return item;
    }


    public Item updateItem(Long ItemId, ItemRequest item) {
        Optional<Category> category = categoryRepository.findByName(item.getCategory());
        Category category1 ;
        if (category.isPresent()) {
             category1 = category.get();
        }else {
            category1 = new Category();
            category1.setName(item.getCategory());
        }
            itemRepository.findById(ItemId)
                    .map(existingItem -> {
                        existingItem.setName(item.getName());
                        existingItem.setPrice(item.getPrice());
                        existingItem.setDescription(item.getDescription());
                        existingItem.setQuantity(item.getQuantity());
//                        existingItem.setCategory(category1);
                        // Copy other properties as needed
                        return itemRepository.save(existingItem);
                    })
                    .orElseThrow(() -> new RuntimeException("Item not found with ID: " + ItemId));
            return null;
        }

    public List<Item> getItemByUserId(Long userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        User user = optionalUser.get();

        return  user.getItems();
    }

    public boolean deleteItem(Long id) {
        if (itemRepository.existsById(id)) {
            itemRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }

    public List<Item> searchItems(String query) {
        return itemRepository.findByNameContainingIgnoreCase(query);
    }

}
