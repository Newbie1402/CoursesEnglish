package com.Courses.Courses.model.request;

import com.Courses.Courses.enums.QuestionType;
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

    @NotNull(message = "Nội dung câu hỏi không được để trống")
    private String content;

    @NotNull(message = "Loại câu hỏi không được để trống")
    private QuestionType type;

    private String correctAnswer;

    private List<String> options;

    private Boolean isShufflable;

    @NotNull(message = "Điểm tối đa không được để trống")
    private Double maxScore;

    @NotNull(message = "ID bài kiểm tra không được để trống")
    private Long examId;
}
