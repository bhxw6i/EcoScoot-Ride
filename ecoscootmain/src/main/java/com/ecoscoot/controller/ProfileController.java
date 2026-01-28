
package com.ecoscoot.controller;

import com.ecoscoot.dto.ProfileDTO;
import com.ecoscoot.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ProfileDTO> getCurrentUserProfile(Principal principal) {
        String email = principal.getName();
        ProfileDTO profile = profileService.getProfileByEmail(email);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfileDTO> getUserProfile(@PathVariable UUID id) {
        ProfileDTO profile = profileService.getProfileById(id);
        return ResponseEntity.ok(profile);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<ProfileDTO>> getAllProfiles() {
        List<ProfileDTO> profiles = profileService.getAllProfiles();
        return ResponseEntity.ok(profiles);
    }
}
