package com.Courses.Courses.model.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonDto {
    private Long lessonId;
    private String title;
    private String contentUrl;
    private Long courseId;
    private LocalDateTime uploadedAt;
    private Boolean active;
}
