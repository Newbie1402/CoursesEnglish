package com.Courses.Courses.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * DTO request tạo mới câu hỏi (Question)
 * Dùng cho API POST /questions
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class QuestionCreateRequest {

    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    private String content;

    @NotBlank(message = "Đáp án đúng không được để trống")
    private String correctAnswer;

    private List<String> options;

    private Boolean isShufflable;

    @NotNull(message = "ID bài kiểm tra không được để trống")
    private Long examId;
}
