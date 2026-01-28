
package com.ecoscoot.repository;

import com.ecoscoot.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Short> {
    Role findByName(String name);
}
