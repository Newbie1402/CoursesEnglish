package com.Courses.Courses.model.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDto {
    private Long studentId;
    private Long userId;
    private String fatherName;
    private String fatherPhone;
    private String motherName;
    private String motherPhone;
    private String application;

    private String fullName;
    private String email;
    private String phoneNumber;
    private String gender;
    private LocalDate dateOfBirth;
    private String address;
    private String avatarUrl;
}
