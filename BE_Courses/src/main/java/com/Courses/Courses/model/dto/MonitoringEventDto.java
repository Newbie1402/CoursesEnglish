package com.Courses.Courses.model.dto;

import com.Courses.Courses.enums.MonitoringEventType;
import lombok.*;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonitoringEventDto {
    private Long examId;
    private Long studentId;
    private Long submissionId;
    private MonitoringEventType eventType;
    private String eventDetail;
    private LocalDateTime timestamp;
}
