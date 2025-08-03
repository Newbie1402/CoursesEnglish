package com.Courses.Courses.model.dto;

import lombok.*;

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
}

