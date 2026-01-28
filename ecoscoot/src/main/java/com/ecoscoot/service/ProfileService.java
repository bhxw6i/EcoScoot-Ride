
package com.ecoscoot.service;

import com.ecoscoot.dto.ProfileDTO;
import com.ecoscoot.model.Profile;
import com.ecoscoot.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    public ProfileDTO getProfileById(UUID id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return convertToDTO(profile);
    }

    public ProfileDTO getProfileByEmail(String email) {
        Profile profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return convertToDTO(profile);
    }

    public List<ProfileDTO> getAllProfiles() {
        return profileRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ProfileDTO convertToDTO(Profile profile) {
        ProfileDTO dto = new ProfileDTO();
        dto.setId(profile.getId());
        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setEmail(profile.getEmail());
        dto.setPhone(profile.getPhone());
        dto.setGender(profile.getGender());
        dto.setDateOfBirth(profile.getDateOfBirth());
        dto.setLicenseNumber(profile.getLicenseNumber());
        dto.setLicenseValidity(profile.getLicenseValidity());
        dto.setRoleId(profile.getRoleId());
        dto.setAvatarUrl(profile.getAvatarUrl());
        return dto;
    }
}
