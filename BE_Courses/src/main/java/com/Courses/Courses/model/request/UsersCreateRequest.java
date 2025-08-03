package com.Courses.Courses.model.request;

import jakarta.validation.constraints.Email;
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
public class UsersCreateRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Tên đầy đủ không được để trống")
    private String fullName;

    private String avatarUrl;
    private String phoneNumber;
    private String gender;
    private String address;
    private LocalDate dateOfBirth;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
}

