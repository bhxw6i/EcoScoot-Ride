
package com.ecoscoot.security;

import com.ecoscoot.model.Profile;
import com.ecoscoot.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private ProfileRepository profileRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Profile profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        String role = "";
        switch (profile.getRoleId()) {
            case 1:
                role = "ROLE_USER";
                break;
            case 2:
                role = "ROLE_ADMIN";
                break;
            case 3:
                role = "ROLE_STAFF";
                break;
            default:
                role = "ROLE_USER";
        }

        return new User(
                profile.getEmail(),
                profile.getPassword() != null ? profile.getPassword() : "",
                Collections.singletonList(new SimpleGrantedAuthority(role))
        );
    }
}
