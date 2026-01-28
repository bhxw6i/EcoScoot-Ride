
package com.ecoscoot.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "profiles")
public class Profile {
    @Id
    @Column(name = "id")
    private UUID id;
    
    @Column(name = "passwords")
    private String password;
    
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    @Column(name = "gender")
    private String gender;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "license_number")
    private String licenseNumber;
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "license_validity")
    private LocalDate licenseValidity;
    
    @Column(name = "role_id", nullable = false)
    private Short roleId;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", insertable = false, updatable = false)
    private Role role;
}
