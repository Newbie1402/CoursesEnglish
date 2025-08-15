package com.Courses.Courses.controller;

import com.Courses.Courses.enums.Role;
import com.Courses.Courses.enums.StatusApplication;
import com.Courses.Courses.model.dto.ExamDto;
import com.Courses.Courses.model.request.ExamCreateRequest;
import com.Courses.Courses.model.request.ExamUpdateRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.service.ExamService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamController {
    @Autowired
    private ExamService examService;

    /**
     * Lấy danh sách tất cả bài kiểm tra (chỉ TEACHER và ADMIN)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ResponseData<List<ExamDto>>> getAllExams() {
        List<ExamDto> exams = examService.getAllExams();
        return ResponseEntity.ok(
                new ResponseData<>(StatusApplication.SUCCESS.getCode(), StatusApplication.SUCCESS.getMessage(), exams)
        );
    }

    /**
     * Lấy danh sách bài kiểm tra đang hoạt động (mọi người)
     */
    @GetMapping("/active")
    public ResponseEntity<ResponseData<List<ExamDto>>> getAllActiveExams() {
        List<ExamDto> exams = examService.getAllActiveExams();
        return ResponseEntity.ok(
                new ResponseData<>(StatusApplication.SUCCESS.getCode(), StatusApplication.SUCCESS.getMessage(), exams)
        );
    }

    /**
     * Lấy chi tiết bài kiểm tra
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResponseData<ExamDto>> getExamById(@PathVariable Long id) {
        ExamDto exam = examService.getExamById(id);
        return ResponseEntity.ok(
                new ResponseData<>(StatusApplication.SUCCESS.getCode(), StatusApplication.SUCCESS.getMessage(), exam)
        );
    }

    /**
     * Tạo bài kiểm tra mới (chỉ TEACHER)
     */
    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ResponseData<ExamDto>> createExam(@Valid @RequestBody ExamCreateRequest request) {
        ExamDto createdExam = examService.createExam(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ResponseData<>(StatusApplication.SUCCESS.getCode(), "Tạo bài kiểm tra thành công", createdExam)
        );
    }

    /**
     * Cập nhật bài kiểm tra (chỉ TEACHER)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ResponseData<ExamDto>> updateExam(
            @PathVariable Long id,
            @Valid @RequestBody ExamUpdateRequest request) {
        if (!id.equals(request.getId())) {
            return ResponseEntity.badRequest().body(
                    new ResponseData<>(400, "ID trong URL và body request không khớp", null)
            );
        }
        ExamDto updatedExam = examService.updateExam(request);
        return ResponseEntity.ok(
                new ResponseData<>(StatusApplication.SUCCESS.getCode(), "Cập nhật bài kiểm tra thành công", updatedExam)
        );
    }

    /**
     * Kích hoạt/vô hiệu hóa bài kiểm tra (chỉ TEACHER)
     */
    @PatchMapping("/{id}/active")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ResponseData<ExamDto>> setExamActive(
            @PathVariable Long id,
            @RequestParam boolean active) {
        ExamDto exam = examService.setExamActive(id, active);
        String message = active ? "Kích hoạt bài kiểm tra thành công" : "Vô hiệu hóa bài kiểm tra thành công";
        return ResponseEntity.ok(
                new ResponseData<>(StatusApplication.SUCCESS.getCode(), message, exam)
        );
    }

    /**
     * Học sinh bắt đầu làm bài kiểm tra (chỉ STUDENT)
     */
    @PostMapping("/{examId}/start")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResponseData<Void>> startExam(
            @PathVariable Long examId,
            @RequestParam Long studentId,
            @RequestParam(required = false) String password) {
        try {
            examService.startExam(examId, studentId, password);
            return ResponseEntity.ok(
                    new ResponseData<>(StatusApplication.SUCCESS.getCode(), "Bắt đầu làm bài thành công", null)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    new ResponseData<>(400, e.getMessage(), null)
            );
        }
    }

    /**
     * Kiểm tra học sinh còn làm bài được không (chỉ STUDENT)
     */
    @GetMapping("/{examId}/check-status")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResponseData<Boolean>> checkStudentExamStatus(
            @PathVariable Long examId,
            @RequestParam Long studentId) {
        boolean isDoingExam = examService.isStudentDoingExam(examId, studentId);
        String message = isDoingExam ? "Học sinh đang làm bài" : "Học sinh đã hết thời gian làm bài";
        return ResponseEntity.ok(
                new ResponseData<>(StatusApplication.SUCCESS.getCode(), message, isDoingExam)
        );
    }
}
