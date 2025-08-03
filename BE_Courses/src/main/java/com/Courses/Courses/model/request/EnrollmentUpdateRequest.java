package com.Courses.Courses.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request cập nhật đăng ký khoá học
 * Dùng cho API PUT/PATCH /enrollments/{id}
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EnrollmentUpdateRequest {
    @NotNull(message = "ID đăng ký không được để trống")
    private Long id;

    @NotNull(message = "ID học viên không được để trống")
    private Long studentId;

    @NotNull(message = "ID khoá học không được để trống")
    private Long courseId;
}
