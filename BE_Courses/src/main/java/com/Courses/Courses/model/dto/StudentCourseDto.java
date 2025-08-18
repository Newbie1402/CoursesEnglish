package com.Courses.Courses.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentCourseDto {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private LocalDateTime enrolledAt;
}
