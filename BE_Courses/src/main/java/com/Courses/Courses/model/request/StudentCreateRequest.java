package com.Courses.Courses.model.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO request tạo mới học viên (Student)
 * Dùng cho API POST /students
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StudentCreateRequest {
    @NotNull(message = "ID người dùng không được để trống")
    private Long userId;

    @NotBlank(message = "Tên phụ huynh không được để trống")
    private String parentName;

    @NotBlank(message = "Số điện thoại phụ huynh không được để trống")
    private String parentPhone;

    private String application;
}
