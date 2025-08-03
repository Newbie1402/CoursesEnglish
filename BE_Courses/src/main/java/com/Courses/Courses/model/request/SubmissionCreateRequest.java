package com.Courses.Courses.model.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotNull;

/**
 * DTO request tạo mới bài nộp (Submission)
 * Dùng cho API POST /submissions
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SubmissionCreateRequest {
    @NotNull(message = "ID học viên không được để trống")
    private Long studentId;

    @NotNull(message = "ID bài kiểm tra không được để trống")
    private Long examId;

    private Double score;

    private String teacherFeedback;
}
