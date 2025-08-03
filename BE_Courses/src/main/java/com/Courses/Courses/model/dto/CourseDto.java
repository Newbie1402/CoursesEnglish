package com.Courses.Courses.model.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseDto {
    private Long id;
    private String title;
    private String description;
    private boolean online;
    private java.time.LocalDate startDate;
    private java.time.LocalDate endDate;
    private Long teacherId;
}

