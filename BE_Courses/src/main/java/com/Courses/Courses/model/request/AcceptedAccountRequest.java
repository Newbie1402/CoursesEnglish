package com.Courses.Courses.model.request;

import com.Courses.Courses.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcceptedAccountRequest {

    @Email(message = "Email không hợp lệ")
    @NotEmpty(message = "Email không được để trống")
    private String email;

    @NotEmpty(message = "Danh sách quyền không được để trống")
    private Set<Role> roles;
}
