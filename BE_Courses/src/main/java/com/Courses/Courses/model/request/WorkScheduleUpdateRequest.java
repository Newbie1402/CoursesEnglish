package com.Courses.Courses.model.request;

import com.Courses.Courses.enums.DayOfWeek;
import com.Courses.Courses.enums.TimeSlot;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.util.Set;

/**
 * DTO request cập nhật lịch làm việc của giáo viên (WorkSchedule)
 * Dùng cho API PUT/PATCH /work-schedules/{id}
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WorkScheduleUpdateRequest {
    @NotNull(message = "ID lịch làm việc không được để trống")
    private Long id;

    @NotNull(message = "ID giáo viên không được để trống")
    private Long teacherId;

    @NotNull(message = "Thứ trong tuần không được để trống")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Ngày làm việc không được để trống")
    private LocalDate date;

    @NotNull(message = "Phải chọn ít nhất một khung giờ")
    private Set<TimeSlot> timeSlot;

    @NotNull(message = "Trạng thái lịch làm việc không được để trống")
    private Boolean available;
}
