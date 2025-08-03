package com.Courses.Courses.model.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDto {
    private Long id;
    private Long userId;
    private String parentName;
    private String parentPhone;
    private String application;
}

