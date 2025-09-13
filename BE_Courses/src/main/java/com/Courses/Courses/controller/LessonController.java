package com.Courses.Courses.controller;

import com.Courses.Courses.model.dto.LessonDto;
import com.Courses.Courses.model.request.LessonUpdateRequest;
import com.Courses.Courses.service.LessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.io.IOException;
import java.util.List;

@Controller
@RestController
@RequestMapping("/api/lessons")
public class LessonController {
    @Autowired
    private LessonService lessonService;

    /**
     * API upload bài học mới (file + thông tin)
     * Chỉ nhận request, validate, gọi service xử lý nghiệp vụ
     */
    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<LessonDto> uploadLesson(
            @RequestParam("title") String title,
            @RequestParam("file") MultipartFile file,
            @RequestParam("courseId") Long courseId
    ) throws IOException {
        LessonDto lessonDto = lessonService.createLesson(title, file, courseId);
        return ResponseEntity.ok(lessonDto);
    }

    /**
     * Lấy tất cả bài giảng (bao gồm cả active/inactive)
     */
    @GetMapping("/view/all")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<LessonDto>> getAllLessons() {
        return ResponseEntity.ok(lessonService.getAllLessons());
    }

    /**
     * Lấy tất cả bài giảng chỉ active
     */
    @GetMapping("/view/active")
    public ResponseEntity<List<LessonDto>> getAllActiveLessons() {
        return ResponseEntity.ok(lessonService.getAllActiveLessons());
    }

    /**
     * Lấy danh sách tất cả bài giảng thuộc một khóa học
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<LessonDto>> getLessonsByCourseId(@PathVariable Long courseId) {
        return ResponseEntity.ok(lessonService.getLessonsByCourseId(courseId));
    }

    /**
     * Lấy danh sách bài giảng đang active của một khóa học
     */
    @GetMapping("/course/{courseId}/active")
    public ResponseEntity<List<LessonDto>> getActiveLessonsByCourseId(@PathVariable Long courseId) {
        return ResponseEntity.ok(lessonService.getActiveLessonsByCourseId(courseId));
    }

    /**
     * Lấy chi tiết 1 bài giảng
     */
    @GetMapping("/view/{id}")
    public ResponseEntity<LessonDto> getLessonById(@PathVariable Long id) {
        return ResponseEntity.ok(lessonService.getLessonById(id));
    }

    /**
     * Cập nhật thông tin bài giảng (title, file mới, courseId)
     */
    @PutMapping(value = "/update/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<LessonDto> updateLesson(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "courseId", required = false) Long courseId
    ) throws IOException {
        LessonDto lessonDto = lessonService.updateLesson(id, title, file, courseId);
        return ResponseEntity.ok(lessonDto);
    }

    /**
     * Đổi trạng thái active/inactive cho bài giảng
     */
    @PatchMapping("/update/{id}/active")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> setLessonActive(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {
        LessonDto lessonDto = lessonService.setLessonActive(id, active);
        String message = active ? "Bài giảng đã được kích hoạt." : "Bài giảng đã bị vô hiệu hóa.";
        return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
            put("message", message);
            put("lesson", lessonDto);
        }});
    }
}
