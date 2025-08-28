package com.Courses.Courses.model.request;

import com.Courses.Courses.enums.DayOfWeek;
import com.Courses.Courses.enums.TimeSlot;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseScheduleRequest {
    @NotNull(message = "Thứ trong tuần không được để trống")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Ca học không được để trống")
    private TimeSlot timeSlot;
}
