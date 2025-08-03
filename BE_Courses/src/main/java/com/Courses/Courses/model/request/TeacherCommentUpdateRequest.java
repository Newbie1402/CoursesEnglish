package com.Courses.Courses.model.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * DTO request cập nhật bình luận của giáo viên (TeacherComment)
 * Dùng cho API PUT/PATCH /teacher-comments/{id}
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TeacherCommentUpdateRequest {
    @NotNull(message = "ID bình luận không được để trống")
    private Long id;

    @NotNull(message = "ID giáo viên không được để trống")
    private Long teacherId;

    @NotNull(message = "ID học viên không được để trống")
    private Long studentId;

    private Long examId;

    @NotBlank(message = "Nội dung bình luận không được để trống")
    private String content;

    private LocalDateTime commentedAt;
}
