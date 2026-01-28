
package com.ecoscoot.service;

import com.ecoscoot.dto.AuthRequestDTO;
import com.ecoscoot.dto.AuthResponseDTO;
import com.ecoscoot.model.Profile;
import com.ecoscoot.repository.ProfileRepository;
import com.ecoscoot.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthResponseDTO authenticate(AuthRequestDTO authRequest) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getEmail(),
                            authRequest.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            // Try custom authentication with the passwords field
            Optional<Profile> profileOpt = profileRepository.findByEmail(authRequest.getEmail());
            if (profileOpt.isPresent() && profileOpt.get().getPassword() != null && 
                    profileOpt.get().getPassword().equals(authRequest.getPassword())) {
                // Manual authentication succeeded
            } else {
                throw new Exception("Invalid username or password", e);
            }
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getEmail());
        final String jwt = jwtTokenUtil.generateToken(userDetails);
        
        Profile profile = profileRepository.findByEmail(authRequest.getEmail())
                .orElseThrow(() -> new Exception("User not found"));
        
        return new AuthResponseDTO(
                jwt,
                "Bearer",
                profile.getFirstName(),
                profile.getLastName(),
                profile.getRoleId()
        );
    }
}
