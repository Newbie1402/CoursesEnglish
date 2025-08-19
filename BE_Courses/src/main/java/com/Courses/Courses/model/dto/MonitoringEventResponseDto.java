package com.Courses.Courses.model.dto;

import com.Courses.Courses.enums.MonitoringEventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonitoringEventResponseDto {
    private Long id;

    // Thông tin học sinh
    private Long studentId;
    private String studentName;
    private String studentEmail;

    // Thông tin bài kiểm tra
    private Long examId;
    private String examTitle;

    // Thông tin bài làm
    private Long submissionId;

    // Thông tin sự kiện
    private MonitoringEventType eventType;
    private String eventDetail;
    private LocalDateTime createdAt;

    // Thông tin giải quyết
    private boolean isResolved;
    private String resolution;
    private LocalDateTime resolvedAt;
}
