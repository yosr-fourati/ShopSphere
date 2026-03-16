package com.AeiselDev.TunisiCart.services;

import com.AeiselDev.TunisiCart.common.ItemRequest;
import com.AeiselDev.TunisiCart.entities.Cart;


import com.AeiselDev.TunisiCart.entities.CartItem;
import com.AeiselDev.TunisiCart.entities.Item;
import com.AeiselDev.TunisiCart.entities.User;
import com.AeiselDev.TunisiCart.exception.ItemNotFoundException;
import com.AeiselDev.TunisiCart.repositories.CartItemRepository;
import com.AeiselDev.TunisiCart.repositories.CartRepository;
import com.AeiselDev.TunisiCart.repositories.ItemRepository;
import com.AeiselDev.TunisiCart.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.Optional;

// CartService.java
@Service
@RequiredArgsConstructor
public class CartService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final ItemRepository itemRepository;
    private final CartItemRepository cartItemRepository;
    private final ItemService itemService;

    public Cart getCart(Long userId) {
        Optional<Cart> cartOptional = cartRepository.findByUserId(userId);
        if (cartOptional.isPresent()) {
            return cartOptional.get();
        } else {
            System.out.println("Creating a new cart for user ID: " + userId);
            return createNewCart(userId);
        }
    }

    @Transactional
    public boolean deleteCart(Long userId) {
        if (cartRepository.existsByUserId(userId)) {
            Cart cart = cartRepository.findByUserId(userId)
                    .orElseThrow(() -> new EntityNotFoundException("Cart not found"));
            // Delete related cart items
            cartItemRepository.deleteByCartId(cart.getId());

            cartRepository.deleteByUserId(userId);
            return true;
        }
        return false;
    }

    private Cart createNewCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        Cart newCart = new Cart();
        newCart.setUserId(user.getId());
        return cartRepository.save(newCart);
    }


    public void addItemToCart(Long userId, Long itemId, int quantity) {
        try {
            // Retrieve the cart for the user
            Cart cart = getCart(userId);
            if (cart == null) {
                throw new RuntimeException("Cart not found for user ID: " + userId);
            }
            // Find the item by ID
            Item item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Item not found with ID: " + itemId));
            ItemRequest request = new ItemRequest();
            request.setQuantity(item.getQuantity() - quantity);
            request.setCategory(item.getCategory().getName());
            request.setName(item.getName());
            request.setDescription(item.getDescription());
            request.setPrice(item.getPrice());
            request.setSellerId(item.getUser().getId());
            Item item1 = itemService.updateItem(item.getId(), request);

            List<CartItem> cartItems  = cartItemRepository.findByCart(cart);

            CartItem cartItem = cartItems.stream()
                    .filter(ci -> ci.getItem().equals(item))
                    .findFirst()
                    .orElse(null);
            if (cartItem != null) {
                // Update existing CartItem
                cartItem.setQuantity(cartItem.getQuantity() + quantity);
                if (cartItem.getQuantity() == 0){
                    cartItemRepository.delete(cartItem);
                    cart.removeItem(item1);}
            } else {
                // Create a new CartItem
                cartItem = new CartItem();
                cartItem.setCart(cart);
                cartItem.setItem(item);
                cartItem.setQuantity(quantity);
            }
            // Save the CartItem to the database
            cartItemRepository.save(cartItem);
            // Optionally update the cart with the new item
            cartRepository.save(cart);
            System.out.println("Item added to cart successfully.");
        } catch (Exception e) {
            System.err.println("Error adding item to cart: " + e.getMessage());
            e.printStackTrace();
        }
    }


    public void updateCartItem(Long userId, Long itemId, int newQuantity) {
        if (newQuantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        Cart cart = getCart(userId);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ItemNotFoundException("Item not found with ID: " + itemId));

        cart.updateItem(item, newQuantity);
        cartRepository.save(cart);
    }


    public void removeItemFromCart(Long CartItem_id) {
        Optional<CartItem> cartItem = cartItemRepository.findById(CartItem_id);
       if(cartItem.isPresent()){
           CartItem cartItem1= cartItem.get();

           Item item = itemRepository.findById(cartItem1.getItem().getId())
                   .orElseThrow(() -> new RuntimeException("Item not found with ID: " + cartItem1.getItem().getId()));
           if(item != null) {
               item.setQuantity(item.getQuantity() + cartItem1.getQuantity());
               itemRepository.save(item);
               cartItemRepository.deleteById(CartItem_id);
           }
       }
    }
}
