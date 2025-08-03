package com.Courses.Courses.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


import java.util.List;

/**
 * DTO request cập nhật câu hỏi (Question)
 * Dùng cho API PUT/PATCH /questions/{id}
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class QuestionUpdateRequest {
    @NotNull(message = "ID câu hỏi không được để trống")
    private Long id;

    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    private String content;

    @NotBlank(message = "Đáp án đúng không được để trống")
    private String correctAnswer;

    private List<String> options;

    private Boolean isShufflable;

    @NotNull(message = "ID bài kiểm tra không được để trống")
    private Long examId;
}
