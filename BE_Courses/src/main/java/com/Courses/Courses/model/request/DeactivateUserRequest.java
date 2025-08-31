package com.Courses.Courses.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DeactivateUserRequest {
    @NotBlank(message = "Reason is required")
    private String reason;
    private String deactivatedByUsername = "admin";
}
