package com.AeiselDev.TunisiCart.entities;

import com.AeiselDev.TunisiCart.enums.RoleType;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import net.minidev.json.annotate.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import static jakarta.persistence.FetchType.EAGER;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    @Column(unique = true)
    private String email;
    private String password;
    private boolean accountLocked;
    private boolean enabled;

    private LocalDate registrationDate;
    private LocalDate lastLogin;

    @ManyToOne(fetch = EAGER)
    private Role role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private Image profileImage;

    @JsonManagedReference
    @OneToMany(mappedBy = "user")
    private List<Item> items;

    @JsonManagedReference
    @OneToMany(mappedBy = "user")
    private List<PurchaseOrder> purchaseOrders;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.role.getName().getAuthorities();
    }


    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !accountLocked;
    }


    @Override
    public boolean isEnabled() {
        return enabled;
    }



    public String getName() {
        return getFullName();
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
