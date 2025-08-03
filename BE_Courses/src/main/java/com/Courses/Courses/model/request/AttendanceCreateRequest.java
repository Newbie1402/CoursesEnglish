package com.Courses.Courses.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
/**
 * Request tạo mới điểm danh
 */
public class AttendanceCreateRequest {
    @NotNull(message = "ID học viên không được để trống")
    private Long studentId;

    @NotNull(message = "ID khoá học không được để trống")
    private Long courseId;

    @NotNull(message = "Ngày điểm danh không được để trống")
    private LocalDate date;

    @NotNull(message = "Trạng thái điểm danh không được để trống")
    private Boolean present;
}
