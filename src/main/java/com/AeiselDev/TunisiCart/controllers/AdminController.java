package com.AeiselDev.TunisiCart.controllers;


import com.AeiselDev.TunisiCart.common.ItemRequest;
import com.AeiselDev.TunisiCart.entities.DetailedSystemStats;
import com.AeiselDev.TunisiCart.entities.Item;
import com.AeiselDev.TunisiCart.entities.Role;
import com.AeiselDev.TunisiCart.entities.User;
import com.AeiselDev.TunisiCart.services.AdminService;
import com.AeiselDev.TunisiCart.services.ProfileService;
import com.AeiselDev.TunisiCart.services.RoleService;
import com.AeiselDev.TunisiCart.services.ItemService;


import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("admin")
@Tag(name = "admin")
public class AdminController {


    private final AdminService adminService;
    private final RoleService roleService;
    private final ItemService itemService;
    private final ProfileService profileService;

    // Profile Endpoints

//    @GetMapping("/profile/{userId}")
//    public ResponseEntity<?> getProfile(@PathVariable Long userId) {
//        return ResponseEntity.ok(profileService.getProfile(userId));
//    }
//
//    @PutMapping("/profile/{userId}")
//    public ResponseEntity<?> updateProfile(@PathVariable Long userId, @RequestBody User profile) {
//        profileService.updateProfile(userId, profile);
//        return ResponseEntity.ok("Profile updated successfully");
//    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        adminService.updateUser(id, user);
        return ResponseEntity.ok("User updated successfully");
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // Role Management Endpoints

    @GetMapping("/roles")
    public ResponseEntity<?> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    @GetMapping("/roles/{id}")
    public ResponseEntity<?> getRoleById(@PathVariable Long id) {
        return ResponseEntity.ok(roleService.getRoleById(id));
    }

//    @PostMapping("/roles")
//    public ResponseEntity<?> createRole(@RequestBody Role role) {
//        roleService.createRole(role);
//        return ResponseEntity.ok("Role created successfully");
//    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody Role role) {
        roleService.updateRole(id, role);
        return ResponseEntity.ok("Role updated successfully");
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<?> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.ok("Role deleted successfully");
    }

    // Item Management Endpoints

    @GetMapping("/items")
    public ResponseEntity<?> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<?> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    @GetMapping("/items/{UserId}")
    public ResponseEntity<List<Item>> getItemUserById(@PathVariable Long UserId) {
        return ResponseEntity.ok(itemService.getItemByUserId(UserId));
    }

    @PostMapping("/items/{UserId}")
    public ResponseEntity<?> createItem(@PathVariable Long UserId, @RequestBody ItemRequest request) {
        itemService.createItem(UserId, request);
        return ResponseEntity.ok("Item created successfully");
    }

    @PutMapping("/items/{UserId}")
    public ResponseEntity<?> updateItem(@PathVariable Long UserId, @RequestBody ItemRequest request) {
        itemService.updateItem(UserId, request);
        return ResponseEntity.ok("Item updated successfully");
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.ok("Item deleted successfully");
    }

    // Other Administrative Tasks

    @GetMapping("/stats")
    public ResponseEntity<DetailedSystemStats> getSystemStats() {
        DetailedSystemStats stats = adminService.getSystemStats();
        return ResponseEntity.ok(stats);
    }
}
