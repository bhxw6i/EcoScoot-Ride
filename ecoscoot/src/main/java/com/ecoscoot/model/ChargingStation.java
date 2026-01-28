
package com.ecoscoot.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "charging_stations")
public class ChargingStation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private UUID id;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "capacity", nullable = false)
    private Integer capacity;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "address")
    private String address;
    
    @Column(name = "location")
    private String location;
}
