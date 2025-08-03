package com.Courses.Courses.model.request;

import com.Courses.Courses.enums.ExamType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

/**
 * Request cập nhật bài kiểm tra (Exam)
 * Dùng cho API PUT/PATCH /exams/{id}
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExamUpdateRequest {
    @NotNull(message = "ID bài kiểm tra không được để trống")
    private Long id;

    @NotBlank(message = "Tiêu đề bài kiểm tra không được để trống")
    private String title;

    @NotNull(message = "Loại bài kiểm tra không được để trống")
    private ExamType type;

    @NotNull(message = "ID khoá học không được để trống")
    private Long courseId;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private LocalDate startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private LocalDate endTime;
}
