package com.Courses.Courses.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private String type;
    private Long entityId;
    private boolean read;
    private LocalDateTime createdAt;
}
