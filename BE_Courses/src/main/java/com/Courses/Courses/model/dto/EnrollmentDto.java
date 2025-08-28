package com.Courses.Courses.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentDto {
    private Long id;

    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseName;
    private String courseDescription;
    private boolean courseOnline;
    private LocalDate courseStartDate;
    private LocalDate courseEndDate;
    private Long teacherId;
    private String teacherName;
    private List<CourseScheduleDto> schedules;

    private LocalDateTime enrolledAt;
}
