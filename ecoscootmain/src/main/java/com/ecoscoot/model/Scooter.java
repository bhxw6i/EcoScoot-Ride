
package com.ecoscoot.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "scooters")
public class Scooter {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private UUID id;
    
    @Column(name = "model", nullable = false)
    private String model;
    
    @Column(name = "max_speed")
    private String maxSpeed;
    
    @Column(name = "range")
    private String range;
    
    @Column(name = "battery_capacity")
    private String batteryCapacity;
    
    @Column(name = "battery_level", nullable = false)
    private Integer batteryLevel;
    
    @Column(name = "charging_time")
    private String chargingTime;
    
    @Column(name = "status", nullable = false)
    private String status;
    
    @Column(name = "hourly_rate")
    private BigDecimal hourlyRate;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "last_maintenance", nullable = false)
    private LocalDateTime lastMaintenance;
    
    // Location would require a special PostgreSQL type
    // @Column(name = "location")
    // private Point location;
    
    @Column(name = "features", columnDefinition = "jsonb")
    private String features;
}
