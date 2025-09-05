package com.Courses.Courses.model.request;

import com.Courses.Courses.enums.ExamType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

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
    private LocalDateTime startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private LocalDateTime endTime;

    @NotNull(message = "Thời lượng làm bài không được để trống")
    private Integer durationMinutes;

    @Min(value = 1, message = "Số lần làm bài cho phép phải từ 1 trở lên")
    private Integer attemptsAllowed = 1;

    private String description;
    private String password;
}
