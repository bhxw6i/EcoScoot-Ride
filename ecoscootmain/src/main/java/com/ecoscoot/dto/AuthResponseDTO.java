
package com.ecoscoot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String type;
    private String firstName;
    private String lastName;
    private Short roleId;
}
