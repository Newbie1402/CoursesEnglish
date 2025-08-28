package com.Courses.Courses.model.response;

import com.Courses.Courses.enums.DayOfWeek;
import com.Courses.Courses.enums.TimeSlot;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response khi phát hiện lịch học bị trùng
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleConflictResponse {
    private DayOfWeek dayOfWeek;
    private TimeSlot timeSlot;
    private String timeRange;
    private Long existingCourseId;
    private String existingCourseTitle;
    private Long newCourseId;
    private String newCourseTitle;
}
