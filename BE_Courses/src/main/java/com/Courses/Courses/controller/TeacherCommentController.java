package com.Courses.Courses.controller;

import com.Courses.Courses.model.dto.TeacherCommentDto;
import com.Courses.Courses.model.request.TeacherCommentCreateRequest;
import com.Courses.Courses.model.request.TeacherCommentUpdateRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.service.TeacherCommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher-comments")
public class TeacherCommentController {

    @Autowired
    private TeacherCommentService teacherCommentService;

    /**
     * API tạo nhận xét mới (chỉ dành cho TEACHER)
     */
    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ResponseData<TeacherCommentDto>> createComment(
            @Valid @RequestBody TeacherCommentCreateRequest request) {
        return teacherCommentService.createComment(request);
    }

    /**
     * API cập nhật nhận xét (chỉ dành cho TEACHER)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') and @teacherCommentService.isCommentCreatedByTeacher(#id, principal.username)")
    public ResponseEntity<ResponseData<TeacherCommentDto>> updateComment(
            @PathVariable Long id,
            @Valid @RequestBody TeacherCommentUpdateRequest request) {
        return teacherCommentService.updateComment(id, request);
    }

    /**
     * API xóa nhận xét (chỉ dành cho TEACHER)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') and @teacherCommentService.isCommentCreatedByTeacher(#id, principal.username)")
    public ResponseEntity<ResponseData<String>> deleteComment(@PathVariable Long id) {
        return teacherCommentService.deleteComment(id);
    }

    /**
     * API lấy tất cả nhận xét đang active
     */
    @GetMapping
    public ResponseEntity<ResponseData<List<TeacherCommentDto>>> getAllActiveComments() {
        return teacherCommentService.getAllActiveComments();
    }

    /**
     * API lấy tất cả nhận xét đã inactive (chỉ dành cho ADMIN hoặc TEACHER)
     */
    @GetMapping("/inactive")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ResponseData<List<TeacherCommentDto>>> getAllInactiveComments() {
        return teacherCommentService.getAllInactiveComments();
    }

    /**
     * API lấy nhận xét theo ID học viên
     */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER') or @securityUtils.isCurrentUser(#studentId)")
    public ResponseEntity<ResponseData<List<TeacherCommentDto>>> getCommentsByStudentId(
            @PathVariable Long studentId) {
        return teacherCommentService.getCommentsByStudentId(studentId);
    }

    /**
     * API lấy nhận xét theo ID giáo viên
     */
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<ResponseData<List<TeacherCommentDto>>> getCommentsByTeacherId(
            @PathVariable Long teacherId) {
        return teacherCommentService.getCommentsByTeacherId(teacherId);
    }

    /**
     * API lấy nhận xét theo ID bài kiểm tra
     */
    @GetMapping("/exam/{examId}")
    public ResponseEntity<ResponseData<List<TeacherCommentDto>>> getCommentsByExamId(
            @PathVariable Long examId) {
        return teacherCommentService.getCommentsByExamId(examId);
    }

    /**
     * API lấy nhận xét theo ID câu hỏi
     */
    @GetMapping("/question/{questionId}")
    public ResponseEntity<ResponseData<List<TeacherCommentDto>>> getCommentsByQuestionId(
            @PathVariable Long questionId) {
        return teacherCommentService.getCommentsByQuestionId(questionId);
    }
}
