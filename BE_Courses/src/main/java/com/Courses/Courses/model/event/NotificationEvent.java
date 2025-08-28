package com.Courses.Courses.model.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEvent implements Serializable {
    private Long userId;
    private String title;
    private String message;
    private String type;
    private Long entityId;
}
