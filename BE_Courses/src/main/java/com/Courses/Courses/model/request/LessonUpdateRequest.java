package com.Courses.Courses.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request cập nhật bài học (Lesson)
 * Dùng cho API PUT/PATCH /lessons/{id}
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LessonUpdateRequest {
    /** Tiêu đề bài học */
    @NotBlank(message = "Tiêu đề bài học không được để trống")
    private String title;

    /** Đường dẫn nội dung bài học (file, video, link, ...) */
    @NotBlank(message = "Đường dẫn nội dung không được để trống")
    private String contentUrl;

    /** ID khoá học liên kết */
    @NotNull(message = "ID khoá học không được để trống")
    private Long courseId;
}
