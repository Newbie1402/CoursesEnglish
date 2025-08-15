package com.Courses.Courses.model.dto;

import com.Courses.Courses.enums.QuestionType;
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
    private QuestionType type;
    private String correctAnswer;
    private List<String> options;
    private boolean isShufflable;
    private Double maxScore;
    private Long examId;
}
