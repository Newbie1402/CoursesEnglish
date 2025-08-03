package com.Courses.Courses.model.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO request cập nhật giáo viên (Teacher)
 * Dùng cho API PUT/PATCH /teachers/{id}
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TeacherUpdateRequest {
    @NotNull(message = "ID giáo viên không được để trống")
    private Long id;

    @NotBlank(message = "Chuyên môn không được để trống")
    private String specialization;

    private String bio;

    @NotNull(message = "Số năm kinh nghiệm không được để trống")
    private Integer experienceYears;
}
