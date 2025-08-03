package com.Courses.Courses.model.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO request cập nhật học viên (Student)
 * Dùng cho API PUT/PATCH /students/{id}
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StudentUpdateRequest {
    @NotNull(message = "ID học viên không được để trống")
    private Long id;

    @NotBlank(message = "Tên phụ huynh không được để trống")
    private String parentName;

    @NotBlank(message = "Số điện thoại phụ huynh không được để trống")
    private String parentPhone;

    private String application;
}
