package com.Courses.Courses.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentRequest {
    @NotNull(message = "ID học sinh không được để trống")
    private Long studentId;

    @NotNull(message = "ID khóa học không được để trống")
    private Long courseId;
}
