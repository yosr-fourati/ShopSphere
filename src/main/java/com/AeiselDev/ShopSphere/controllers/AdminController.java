package com.AeiselDev.ShopSphere.controllers;


import com.AeiselDev.ShopSphere.common.ItemRequest;
import com.AeiselDev.ShopSphere.entities.DetailedSystemStats;
import com.AeiselDev.ShopSphere.entities.Item;
import com.AeiselDev.ShopSphere.entities.Role;
import com.AeiselDev.ShopSphere.entities.User;
import com.AeiselDev.ShopSphere.services.AdminService;
import com.AeiselDev.ShopSphere.services.ProfileService;
import com.AeiselDev.ShopSphere.services.RoleService;
import com.AeiselDev.ShopSphere.services.ItemService;


import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
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
    public ResponseEntity<?> getAllItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(itemService.getAllItems(PageRequest.of(page, size)));
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

    // Seller Approval Endpoints

    @GetMapping("/sellers/pending")
    public ResponseEntity<?> getPendingSellers() {
        return ResponseEntity.ok(adminService.getPendingSellers());
    }

    @PutMapping("/sellers/{id}/approve")
    public ResponseEntity<?> approveSeller(@PathVariable Long id) {
        adminService.approveSeller(id);
        return ResponseEntity.ok("Seller approved successfully");
    }

    @PutMapping("/sellers/{id}/reject")
    public ResponseEntity<?> rejectSeller(@PathVariable Long id) {
        adminService.rejectSeller(id);
        return ResponseEntity.ok("Seller rejected");
    }

    // Other Administrative Tasks

    @GetMapping("/stats")
    public ResponseEntity<DetailedSystemStats> getSystemStats() {
        DetailedSystemStats stats = adminService.getSystemStats();
        return ResponseEntity.ok(stats);
    }
}
