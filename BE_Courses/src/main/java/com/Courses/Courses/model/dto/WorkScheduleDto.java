package com.Courses.Courses.model.dto;

import com.Courses.Courses.enums.DayOfWeek;
import com.Courses.Courses.enums.TimeSlot;
import lombok.*;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkScheduleDto {
    private Long id;
    private Long teacherId;
    private DayOfWeek dayOfWeek;
    private LocalDate date;
    private Set<TimeSlot> timeSlot;
    private boolean available;
}
