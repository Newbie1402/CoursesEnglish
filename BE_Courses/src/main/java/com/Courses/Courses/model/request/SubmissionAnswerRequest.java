package com.Courses.Courses.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO request gửi câu trả lời của học sinh
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SubmissionAnswerRequest {
    @NotNull(message = "ID câu hỏi không được để trống")
    private Long questionId;

    private String studentAnswer;
}
