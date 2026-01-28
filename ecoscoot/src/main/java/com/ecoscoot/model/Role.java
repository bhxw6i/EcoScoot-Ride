
package com.ecoscoot.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "roles")
public class Role {
    @Id
    @Column(name = "id")
    private Short id;
    
    @Column(name = "name", nullable = false)
    private String name;
}
