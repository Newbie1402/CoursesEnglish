package com.Courses.Courses.model.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request lọc khoá học
 * Dùng cho API GET /courses/filter
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CourseFilterRequest {
    private String title;
    private Boolean online;
    private Long teacherId;
    private java.time.LocalDate startDateFrom;
    private java.time.LocalDate startDateTo;
    private java.time.LocalDate endDateFrom;
    private java.time.LocalDate endDateTo;
}
