package com.Courses.Courses.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request cập nhật khoá học
 * Dùng cho API PUT/PATCH /courses/{id}
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CourseUpdateRequest {
    @NotNull(message = "ID khoá học không được để trống")
    private Long id;

    @NotBlank(message = "Tên khoá học không được để trống")
    private String title;

    private String description;

    @NotNull(message = "Trạng thái online không được để trống")
    private Boolean online;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private java.time.LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private java.time.LocalDate endDate;

    @NotNull(message = "ID giáo viên không được để trống")
    private Long teacherId;
}
