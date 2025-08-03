package com.Courses.Courses.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
/**
 * Request cập nhật điểm danh
 */
public class AttendanceUpdateRequest {
    @NotNull(message = "ID điểm danh không được để trống")
    private Long id;

    @NotNull(message = "Trạng thái điểm danh không được để trống")
    private Boolean present;

}
