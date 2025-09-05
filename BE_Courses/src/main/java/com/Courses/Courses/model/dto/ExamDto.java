package com.Courses.Courses.model.dto;

import com.Courses.Courses.enums.ExamType;
import lombok.*;

import java.time.LocalDateTime;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamDto {
    private Long examId;
    private String title;
    private ExamType type;
    private Long courseId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private Integer attemptsAllowed;
    private String description;
    private String password;
    private Boolean active;
}
