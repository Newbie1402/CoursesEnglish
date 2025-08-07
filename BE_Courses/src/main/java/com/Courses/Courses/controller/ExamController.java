package com.Courses.Courses.controller;

import com.Courses.Courses.exception.StatusApplication;
import com.Courses.Courses.model.dto.ExamDto;
import com.Courses.Courses.model.request.ExamCreateRequest;
import com.Courses.Courses.model.request.ExamUpdateRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.service.ExamService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RestController
@RequestMapping("/api/exams")
public class ExamController {
    @Autowired
    private ExamService examService;

    /**
     * Tạo mới bài kiểm tra
     */
    @PostMapping("/create")
    public ResponseEntity<ResponseData<ExamDto>> createExam(@Valid @RequestBody ExamCreateRequest request) {
        ExamDto examDto = examService.createExam(request);
        return ResponseEntity.status(StatusApplication.SUCCESS.getCode()).body(
                new ResponseData<>(
                        StatusApplication.SUCCESS.getCode(),
                        StatusApplication.SUCCESS.getMessage(),
                        examDto
                )
        );
    }

    /**
     * Lấy toàn bộ bài kiểm tra (bao gồm cả active/inactive)
     */
    @GetMapping("/view/all")
    public ResponseEntity<ResponseData<List<ExamDto>>> getAllExams() {
        List<ExamDto> list = examService.getAllExams();
        return ResponseEntity.status(StatusApplication.SUCCESS.getCode()).body(
                new ResponseData<>(
                        StatusApplication.SUCCESS.getCode(),
                        StatusApplication.SUCCESS.getMessage(),
                        list
                )
        );
    }

    /**
     * Lấy toàn bộ bài kiểm tra chỉ active
     */
    @GetMapping("/view/active")
    public ResponseEntity<ResponseData<List<ExamDto>>> getAllActiveExams() {
        List<ExamDto> list = examService.getAllActiveExams();
        return ResponseEntity.status(StatusApplication.SUCCESS.getCode()).body(
                new ResponseData<>(
                        StatusApplication.SUCCESS.getCode(),
                        StatusApplication.SUCCESS.getMessage(),
                        list
                )
        );
    }

    /**
     * Sửa thông tin bài kiểm tra
     */
    @PutMapping("/update")
    public ResponseEntity<ResponseData<ExamDto>> updateExam(@Valid @RequestBody ExamUpdateRequest request) {
        ExamDto examDto = examService.updateExam(request);
        return ResponseEntity.status(StatusApplication.SUCCESS.getCode()).body(
                new ResponseData<>(
                        StatusApplication.SUCCESS.getCode(),
                        StatusApplication.SUCCESS.getMessage(),
                        examDto
                )
        );
    }

    /**
     * Đổi trạng thái active/inactive cho bài kiểm tra
     */
    @PatchMapping("/active/{id}")
    public ResponseEntity<ResponseData<ExamDto>> setExamActive(@PathVariable Long id, @RequestParam boolean active) {
        ExamDto examDto = examService.setExamActive(id, active);
        String message = active ? "Bài kiểm tra đã được kích hoạt." : "Bài kiểm tra đã được vô hiệu hóa.";
        return ResponseEntity.status(StatusApplication.SUCCESS.getCode()).body(
                new ResponseData<>(
                        StatusApplication.SUCCESS.getCode(),
                        message,
                        examDto
                )
        );
    }

    /**
     * Lấy chi tiết 1 bài kiểm tra
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResponseData<ExamDto>> getExamById(@PathVariable Long id) {
        ExamDto examDto = examService.getExamById(id);
        return ResponseEntity.status(StatusApplication.SUCCESS.getCode()).body(
                new ResponseData<>(
                        StatusApplication.SUCCESS.getCode(),
                        StatusApplication.SUCCESS.getMessage(),
                        examDto
                )
        );
    }

    /**
     * Endpoint cho học sinh bắt đầu làm bài kiểm tra
     * Khi học sinh nhấn "Bắt đầu làm bài", gọi API này để lưu trạng thái vào Redis và cập nhật Submission
     */
    @PostMapping("/{examId}/start")
    public ResponseEntity<ResponseData<String>> startExam(@PathVariable Long examId, @RequestParam Long studentId) {
        try {
            examService.startExam(examId, studentId);
            return ResponseEntity.status(StatusApplication.SUCCESS.getCode()).body(
                    new ResponseData<>(
                            StatusApplication.SUCCESS.getCode(),
                            "Bắt đầu làm bài thành công!",
                            null
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.status(400).body(
                    new ResponseData<>(
                            400,
                            e.getMessage(),
                            null
                    )
            );
        }
    }

    /**
     * Endpoint kiểm tra học sinh còn làm bài được không
     * Trả về true nếu còn làm bài, false nếu đã hết thời gian
     */
    @GetMapping("/{examId}/doing")
    public ResponseEntity<ResponseData<Boolean>> isStudentDoingExam(@PathVariable Long examId, @RequestParam Long studentId) {
        boolean isDoing = examService.isStudentDoingExam(examId, studentId);
        return ResponseEntity.status(StatusApplication.SUCCESS.getCode()).body(
                new ResponseData<>(
                        StatusApplication.SUCCESS.getCode(),
                        isDoing ? "Học sinh còn thời gian làm bài." : "Học sinh đã hết thời gian làm bài.",
                        isDoing
                )
        );
    }

}
