
package com.ecoscoot.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private UUID id;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "pickup_date")
    private LocalDateTime pickupDate;
    
    @Column(name = "dropoff_date")
    private LocalDateTime dropoffDate;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "scooter_id", nullable = false)
    private UUID scooterId;
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @Column(name = "status", nullable = false)
    private String status;
    
    @Column(name = "cost")
    private BigDecimal cost;
    
    @Column(name = "start_location", nullable = false)
    private String startLocation;
    
    @Column(name = "dropoff_location")
    private String dropoffLocation;
    
    @Column(name = "pickup_location")
    private String pickupLocation;
    
    @Column(name = "end_location")
    private String endLocation;
    
    @Column(name = "total_price")
    private BigDecimal totalPrice;
    
    @Column(name = "duration")
    private Integer duration;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private Profile user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scooter_id", insertable = false, updatable = false)
    private Scooter scooter;
}
