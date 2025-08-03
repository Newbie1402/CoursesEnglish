package com.Courses.Courses.model.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionDto {
    private Long id;
    private String content;
    private String correctAnswer;
    private List<String> options;
    private boolean isShufflable;
    private Long examId;
}
