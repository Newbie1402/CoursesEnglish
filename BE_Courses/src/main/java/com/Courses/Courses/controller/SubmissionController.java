package com.Courses.Courses.controller;

import com.Courses.Courses.enums.StatusApplication;
import com.Courses.Courses.model.dto.SubmissionDto;
import com.Courses.Courses.model.dto.StudentBasicDto;
import com.Courses.Courses.model.entity.SubmissionAnswer;
import com.Courses.Courses.model.request.SubmissionAnswerRequest;
import com.Courses.Courses.model.request.SubmissionCreateRequest;
import com.Courses.Courses.model.request.SubmissionUpdateRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.service.ExamService;
import com.Courses.Courses.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {
    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private ExamService examService;

    /**
     * Lấy tất cả bài nộp của một học sinh
     * Chỉ học sinh đó mới nhìn thấy bài nộp của mình
     */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('STUDENT') ")
    public ResponseEntity<ResponseData<List<SubmissionDto>>> getAllByStudent(@PathVariable Long studentId) {
        return submissionService.getAllByStudent(studentId);
    }

    /**
     * Lấy tất cả bài nộp của một bài kiểm tra (chỉ dành cho TEACHER và ADMIN)
     */
    @GetMapping("/exam/{examId}")
    @PreAuthorize(
            "hasRole('ADMIN') " +
                    "or hasRole('TEACHER') " +
                    "or (hasRole('STUDENT') and @securityUtils.isCurrentStudentOfExam(#examId))"
    )
    public ResponseEntity<ResponseData<List<SubmissionDto>>> getAllByExam(@PathVariable Long examId) {
        return submissionService.getAllByExamId(examId);
    }

    /**
     * Tạo bài nộp mới khi học sinh bắt đầu làm bài kiểm tra
     */
    @PostMapping("/start-exam")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResponseData<SubmissionDto>> startExam(
            @RequestParam Long examId,
            @RequestParam Long studentId,
            @RequestParam(required = false) String password) {
        try {
            // Khởi tạo bài kiểm tra và kiểm tra thời gian
            examService.startExam(examId, studentId, password);

            // Tạo submission mới hoặc lấy submission đã có
            SubmissionCreateRequest request = new SubmissionCreateRequest();
            request.setExamId(examId);
            request.setStudentId(studentId);

            return submissionService.createSubmission(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    new ResponseData<>(400, e.getMessage(), null)
            );
        }
    }

    /**
     * Lưu câu trả lời của học sinh trong quá trình làm bài
     */
    @PostMapping("/{submissionId}/answers")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResponseData<SubmissionAnswer>> saveAnswer(
            @PathVariable Long submissionId,
            @RequestBody @Valid SubmissionAnswerRequest request) {

        // Kiểm tra xem học sinh còn đủ thời gian làm bài không
        if (!submissionService.isExamActive(submissionId)) {
            return ResponseEntity.badRequest().body(
                    new ResponseData<>(400, "Bạn đã hết thời gian làm bài!", null)
            );
        }

        return submissionService.saveAnswer(submissionId, request);
    }

    /**
     * Lấy danh sách các câu trả lời của một bài nộp (dành cho giáo viên chấm điểm)
     */
    @GetMapping("/{submissionId}/answers")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'STUDENT') or @submissionService.isSubmissionOwnedByCurrentUser(#submissionId)")
    public ResponseEntity<ResponseData<List<SubmissionAnswer>>> getSubmissionAnswers(@PathVariable Long submissionId) {
        return submissionService.getSubmissionAnswers(submissionId);
    }

    /**
     * Nộp bài và kết thúc bài kiểm tra, chấm điểm tự động cho phần trắc nghiệm
     */
    @PostMapping("/{submissionId}/finish")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResponseData<SubmissionDto>> finishExam(@PathVariable Long submissionId) {
        try {
            double score = examService.finishExam(submissionId);
            SubmissionDto submission = submissionService.getSubmissionById(submissionId);

            return ResponseEntity.ok(
                    new ResponseData<>(
                            StatusApplication.SUCCESS.getCode(),
                            "Nộp bài thành công. Điểm của phần trắc nghiệm: " + score,
                            submission
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    new ResponseData<>(400, e.getMessage(), null)
            );
        }
    }

    /**
     * Giáo viên chấm điểm cho câu hỏi tự luận
     */
    @PatchMapping("/answers/{answerId}/grade")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ResponseData<SubmissionAnswer>> gradeEssayQuestion(
            @PathVariable Long answerId,
            @RequestBody Map<String, Object> gradeRequest) {

        Double score = Double.parseDouble(gradeRequest.get("score").toString());
        String feedback = (String) gradeRequest.get("feedback");

        try {
            examService.gradeEssayQuestion(answerId, score, feedback);
            SubmissionAnswer answer = submissionService.getAnswerById(answerId);

            return ResponseEntity.ok(
                    new ResponseData<>(
                            StatusApplication.SUCCESS.getCode(),
                            "Chấm điểm câu tự luận thành công",
                            answer
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    new ResponseData<>(400, e.getMessage(), null)
            );
        }
    }

    /**
     * Cập nhật thông tin bài nộp (điểm, nhận xét)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ResponseData<SubmissionDto>> updateSubmission(
            @PathVariable Long id,
            @RequestBody @Valid SubmissionUpdateRequest request) {
        if (!id.equals(request.getId())) {
            return ResponseEntity.badRequest().body(
                    new ResponseData<>(400, "ID trong URL và body request không khớp", null)
            );
        }
        return submissionService.updateSubmission(request);
    }

    /**
     * Xóa bài nộp
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ResponseData<Void>> deleteSubmission(@PathVariable Long id) {
        return submissionService.deleteSubmission(id);
    }

    /**
     * Kiểm tra trạng thái còn thời gian làm bài không
     */
    @GetMapping("/{submissionId}/status")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResponseData<Boolean>> checkExamStatus(@PathVariable Long submissionId) {
        boolean isActive = submissionService.isExamActive(submissionId);
        String message = isActive ? "Còn thời gian làm bài" : "Đã hết thời gian làm bài";

        return ResponseEntity.ok(
                new ResponseData<>(StatusApplication.SUCCESS.getCode(), message, isActive)
        );
    }

    /**
     * Lấy chi tiết bài nộp
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN') or @submissionService.isSubmissionOwnedByCurrentUser(#id)")
    public ResponseEntity<ResponseData<SubmissionDto>> getSubmissionById(@PathVariable Long id) {
        return ResponseEntity.ok(
                new ResponseData<>(
                        StatusApplication.SUCCESS.getCode(),
                        StatusApplication.SUCCESS.getMessage(),
                        submissionService.getSubmissionById(id)
                )
        );
    }

    //Lấy danh sách học sinh chưa làm một bài kiểm tra cụ thể
    @GetMapping("/not-attempted/exam/{examId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ResponseData<List<StudentBasicDto>>> getStudentsNotAttemptedExam(@PathVariable Long examId) {
        return submissionService.findStudentsNotAttemptedExam(examId);
    }

    //Lấy danh sách học sinh chưa làm bất kỳ bài kiểm tra nào trong khóa học
    @GetMapping("/not-attempted/course/{courseId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ResponseData<List<StudentBasicDto>>> getStudentsNotAttemptedAnyCourseExams(@PathVariable Long courseId) {
        return submissionService.findStudentsNotAttemptedAnyCourseExams(courseId);
    }
}
