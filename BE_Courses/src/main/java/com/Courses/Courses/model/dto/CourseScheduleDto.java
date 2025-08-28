package com.Courses.Courses.model.dto;

import com.Courses.Courses.enums.DayOfWeek;
import com.Courses.Courses.enums.TimeSlot;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseScheduleDto {
    private Long id;
    private DayOfWeek dayOfWeek;
    private TimeSlot timeSlot;
    private String timeRange;
}
