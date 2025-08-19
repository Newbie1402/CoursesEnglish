package com.Courses.Courses.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventResolveRequest {
    @NotNull(message = "ID giáo viên giải quyết không được để trống")
    private Long resolvedBy;

    @NotNull(message = "Ghi chú giải quyết không được để trống")
    private String resolveNote;
}
