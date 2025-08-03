package com.Courses.Courses.model.dto;

import com.Courses.Courses.enums.ExamType;
import lombok.*;

import java.time.LocalDate;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamDto {
    private Long id;
    private String title;
    private ExamType type;
    private Long courseId;
    private LocalDate startTime;
    private LocalDate endTime;
}
