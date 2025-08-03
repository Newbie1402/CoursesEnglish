package com.Courses.Courses.model.dto;

import com.Courses.Courses.enums.Role;
import com.Courses.Courses.enums.Status;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsersDto {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Set<Role> roles;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private Status status;
    private String avatarUrl;
    private Boolean isOauth2;
}

