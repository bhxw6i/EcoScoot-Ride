
package com.ecoscoot.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ProfileDTO {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String gender;
    private LocalDate dateOfBirth;
    private String licenseNumber;
    private LocalDate licenseValidity;
    private Short roleId;
    private String avatarUrl;
}
