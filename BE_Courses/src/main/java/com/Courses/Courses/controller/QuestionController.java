package com.Courses.Courses.controller;

import com.Courses.Courses.model.dto.QuestionDto;
import com.Courses.Courses.model.request.QuestionCreateRequest;
import com.Courses.Courses.model.request.QuestionUpdateRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    /**
     * Lấy tất cả câu hỏi
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ResponseData<List<QuestionDto>>> getAllQuestions() {
        return questionService.getAllQuestions();
    }

    /**
     * Lấy tất cả câu hỏi của một bài kiểm tra
     */
    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'STUDENT')")
    public ResponseEntity<ResponseData<List<QuestionDto>>> getQuestionsByExamId(@PathVariable Long examId) {
        return questionService.getAllQuestionsByExamId(examId);
    }

    /**
     * Lấy chi tiết câu hỏi theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'STUDENT')")
    public ResponseEntity<ResponseData<QuestionDto>> getQuestionById(@PathVariable Long id) {
        return questionService.getQuestionById(id);
    }

    /**
     * Tạo câu hỏi mới
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ResponseData<QuestionDto>> createQuestion(@RequestBody @Valid QuestionCreateRequest request) {
        return questionService.createQuestion(request);
    }

    /**
     * Cập nhật câu hỏi
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ResponseData<QuestionDto>> updateQuestion(
            @PathVariable Long id,
            @RequestBody @Valid QuestionUpdateRequest request) {
        // Đảm bảo ID trong URL và trong request trùng khớp
        if (!id.equals(request.getId())) {
            return ResponseEntity.badRequest()
                    .body(new ResponseData<>(400, "ID trong URL và body request không khớp", null));
        }
        return questionService.updateQuestion(request);
    }

    /**
     * Xóa câu hỏi
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ResponseData<Void>> deleteQuestion(@PathVariable Long id) {
        return questionService.deleteQuestion(id);
    }
}
