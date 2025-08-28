package com.Courses.Courses.model.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherDto {
    private Long teacherId;
    private Long userId;
    private String bio;
    private String specialization;
    private Integer experienceYears;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String gender;
    private LocalDate dateOfBirth;
    private String address;
    private String avatarUrl;
}