package com.Courses.Courses.controller;

import com.Courses.Courses.model.entity.SubmissionAnswer;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/submission-answers")
public class SubmissionAnswerController {
    @Autowired
    private SubmissionService submissionService;

    /**
     * Thêm câu trả lời mới cho bài nộp
     * @param submissionId ID của bài nộp
     * @param answer Thông tin câu trả lời
     * @return Câu trả lời đã được thêm
     */
    @PostMapping("/submission/{submissionId}")
    public ResponseEntity<ResponseData<SubmissionAnswer>> addAnswer(
            @PathVariable Long submissionId,
            @RequestBody @Valid SubmissionAnswer answer) {
        return submissionService.addAnswer(submissionId, answer);
    }

    /**
     * Cập nhật câu trả lời
     * @param id ID của câu trả lời
     * @param answer Thông tin cập nhật
     * @return Câu trả lời sau khi cập nhật
     */
    @PutMapping("/{id}")
    public ResponseEntity<ResponseData<SubmissionAnswer>> updateAnswer(
            @PathVariable Long id,
            @RequestBody @Valid SubmissionAnswer answer) {
        return submissionService.updateAnswer(id, answer);
    }

    /**
     * Xóa câu trả lời
     * @param id ID của câu trả lời cần xóa
     * @return Kết quả xóa
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseData<Void>> deleteAnswer(@PathVariable Long id) {
        return submissionService.deleteAnswer(id);
    }
}
