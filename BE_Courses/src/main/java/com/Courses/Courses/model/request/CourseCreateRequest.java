package com.Courses.Courses.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CourseCreateRequest {
    @NotBlank(message = "Tên khoá học không được để trống")
    private String title;

    private String description;

    @NotNull(message = "Trạng thái online không được để trống")
    private Boolean online;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private java.time.LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private java.time.LocalDate endDate;

    @NotNull(message = "ID giáo viên không được để trống")
    private Long teacherId;

    @NotNull(message = "Lịch học không được để trống")
    @Size(min = 1, message = "Phải có ít nhất một lịch học")
    private List<CourseScheduleRequest> schedules;
}
