package com.Courses.Courses.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request tạo mới đăng ký khoá học
 * Dùng cho API POST /enrollments
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EnrollmentCreateRequest {
    @NotNull(message = "ID học viên không được để trống")
    private Long studentId;

    @NotNull(message = "ID khoá học không được để trống")
    private Long courseId;
}
