package com.Courses.Courses.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO request cập nhật thông tin người dùng (Users)
 * Dùng cho API PUT/PATCH /users/{id}
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UsersUpdateRequest {
    @NotNull(message = "ID người dùng không được để trống")
    private Long id;

    @NotBlank(message = "Tên đầy đủ không được để trống")
    private String fullName;

    private String avatarUrl;

    private String phoneNumber;

    private String gender;

    private String address;

    private java.time.LocalDate dateOfBirth;
}
