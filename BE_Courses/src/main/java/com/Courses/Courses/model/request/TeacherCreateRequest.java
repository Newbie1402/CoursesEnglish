package com.Courses.Courses.model.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO request tạo mới giáo viên (Teacher)
 * Dùng cho API POST /teachers
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TeacherCreateRequest {
    @NotNull(message = "ID người dùng không được để trống")
    private Long userId;

    @NotBlank(message = "Chuyên môn không được để trống")
    private String specialization;

    private String bio;

    @NotNull(message = "Số năm kinh nghiệm không được để trống")
    private Integer experienceYears;
}
