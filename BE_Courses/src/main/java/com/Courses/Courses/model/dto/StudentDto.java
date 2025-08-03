package com.Courses.Courses.model.dto;

import lombok.*;

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
}

