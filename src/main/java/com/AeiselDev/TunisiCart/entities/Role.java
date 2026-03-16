package com.AeiselDev.TunisiCart.entities;

import com.AeiselDev.TunisiCart.enums.RoleType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "role")
@EntityListeners(AuditingEntityListener.class)
public class Role {

    @Id
    @GeneratedValue
    private Long id;

    @Setter
    @Enumerated(EnumType.STRING)
    private RoleType name;

    @OneToMany(mappedBy = "role")
    @JsonIgnore
    private List<User> users;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    @Column(insertable = false)
    private LocalDateTime lastModifiedDate;

    // Uncomment and implement if needed
    // public List<SimpleGrantedAuthority> getAuthorities() {
    //     var authorities = getPermissions()
    //             .stream()
    //             .map(permission -> new SimpleGrantedAuthority(permission.name()))
    //             .collect(Collectors.toList());
    //     authorities.add(new SimpleGrantedAuthority("ROLE_" + this.name));
    //     return authorities;
    // }
}

