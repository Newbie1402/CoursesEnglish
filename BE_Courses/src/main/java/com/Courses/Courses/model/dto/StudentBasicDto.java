package com.Courses.Courses.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentBasicDto {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String fatherName;
    private String fatherPhone;
    private String motherName;
    private String motherPhone;
}
