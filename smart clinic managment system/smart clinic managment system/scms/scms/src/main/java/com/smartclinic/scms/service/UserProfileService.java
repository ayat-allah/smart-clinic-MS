package com.smartclinic.scms.service;

import com.smartclinic.scms.dto.ProfileResponse;
import com.smartclinic.scms.entity.User;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    public ProfileResponse getCurrentUserProfile() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        ProfileResponse response = new ProfileResponse();
        response.setFullName(currentUser.getName());
        response.setPhoneNumber(currentUser.getPhoneNumber());
        response.setEmail(currentUser.getEmail());

        return response;
    }
}