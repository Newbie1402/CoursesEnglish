package com.Courses.Courses.model.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class TeacherCommentDto {
    private Long id;
    private Long teacherId;
    private Long studentId;
    private Long examId;
    private Long questionId;
    private String content;
    private LocalDateTime commentedAt;
}
