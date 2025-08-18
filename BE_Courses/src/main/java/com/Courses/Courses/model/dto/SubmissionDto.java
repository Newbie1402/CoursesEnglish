package com.Courses.Courses.model.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionDto {
    private Long id;
    private Long studentId;
    private Long examId;
    private Double score;
    private String teacherFeedback;
    private LocalDateTime submittedAt;
    private LocalDateTime startedAt;
    private LocalDateTime deadline;
    private Double maxScore;
}
