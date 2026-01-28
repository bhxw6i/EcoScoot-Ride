
package com.ecoscoot.repository;

import com.ecoscoot.model.Scooter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScooterRepository extends JpaRepository<Scooter, UUID> {
    List<Scooter> findByStatus(String status);
    List<Scooter> findByBatteryLevelLessThan(Integer batteryLevel);
}
