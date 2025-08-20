package com.Courses.Courses.controller;

import com.Courses.Courses.enums.ActionType;
import com.Courses.Courses.model.dto.QuizChoiceActionDto;
import com.Courses.Courses.model.entity.SubmissionAnswer;
import com.Courses.Courses.model.request.ChoiceTrackingRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.service.QuizTrackingService;
import com.Courses.Courses.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/submission-answers")
public class SubmissionAnswerController {
    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private QuizTrackingService quizTrackingService;

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
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseData<Void>> deleteAnswer(@PathVariable Long id) {
        return submissionService.deleteAnswer(id);
    }

    /**
     * Ghi nhận hành động chọn đáp án của học sinh (không làm thay đổi dữ liệu bài làm chính thức)
     * Chỉ dùng để theo dõi hành vi học sinh trong quá trình làm bài
     */
    @PostMapping("/track-choice")
    public ResponseEntity<ResponseData<Void>> trackChoiceAction(
            @RequestBody @Valid ChoiceTrackingRequest request) {
        try {
            // Ghi nhận hành động thông qua Kafka
            CompletableFuture<Void> future;

            switch(request.getActionType()) {
                case SELECT:
                    future = quizTrackingService.trackSelectChoice(
                        request.getUserId(),
                        request.getQuizId(),
                        request.getQuestionId(),
                        request.getChoiceId(),
                        request.getChoiceIndex(),
                        request.getCurrentChoices()
                    );
                    break;
                case UNSELECT:
                    future = quizTrackingService.trackUnselectChoice(
                        request.getUserId(),
                        request.getQuizId(),
                        request.getQuestionId(),
                        request.getChoiceId(),
                        request.getChoiceIndex(),
                        request.getCurrentChoices()
                    );
                    break;
                case SUBMIT:
                    future = quizTrackingService.trackSubmitQuestion(
                        request.getUserId(),
                        request.getQuizId(),
                        request.getQuestionId(),
                        request.getCurrentChoices()
                    );
                    break;
                default:
                    return ResponseEntity.badRequest()
                        .body(ResponseData.<Void>builder()
                                .StatusCode(HttpStatus.BAD_REQUEST.value())
                                .Message("Loại hành động không hợp lệ")
                                .data(null)
                                .build());
            }

            // Không chờ đợi future hoàn thành để không làm chậm request
            // Việc ghi nhận sẽ được thực hiện bất đồng bộ

            return ResponseEntity.ok()
                .body(ResponseData.<Void>builder()
                        .StatusCode(HttpStatus.OK.value())
                        .Message("Đã ghi nhận hành động chọn đáp án")
                        .data(null)
                        .build());
        } catch (Exception e) {
            // Lỗi trong quá trình ghi nhận không nên ảnh hưởng đến luồng chính của ứng dụng
            return ResponseEntity.ok()
                .body(ResponseData.<Void>builder()
                        .StatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
                        .Message("Không thể ghi nhận hành động: " + e.getMessage())
                        .data(null)
                        .build());
        }
    }

    /**
     * Ghi nhận hàng loạt hành động chọn đáp án (batch)
     */
    @PostMapping("/track-choices/batch")
    public ResponseEntity<ResponseData<Void>> trackChoiceActions(
            @RequestBody @Valid List<ChoiceTrackingRequest> requests) {
        try {
            for (ChoiceTrackingRequest request : requests) {
                switch(request.getActionType()) {
                    case SELECT:
                        quizTrackingService.trackSelectChoice(
                            request.getUserId(),
                            request.getQuizId(),
                            request.getQuestionId(),
                            request.getChoiceId(),
                            request.getChoiceIndex(),
                            request.getCurrentChoices()
                        );
                        break;
                    case UNSELECT:
                        quizTrackingService.trackUnselectChoice(
                            request.getUserId(),
                            request.getQuizId(),
                            request.getQuestionId(),
                            request.getChoiceId(),
                            request.getChoiceIndex(),
                            request.getCurrentChoices()
                        );
                        break;
                    case SUBMIT:
                        quizTrackingService.trackSubmitQuestion(
                            request.getUserId(),
                            request.getQuizId(),
                            request.getQuestionId(),
                            request.getCurrentChoices()
                        );
                        break;
                }
            }

            return ResponseEntity.ok()
                .body(ResponseData.<Void>builder()
                        .StatusCode(HttpStatus.OK.value())
                        .Message("Đã ghi nhận tất cả hành động chọn đáp án")
                        .data(null)
                        .build());
        } catch (Exception e) {
            return ResponseEntity.ok()
                .body(ResponseData.<Void>builder()
                        .StatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
                        .Message("Không thể ghi nhận các hành động: " + e.getMessage())
                        .data(null)
                        .build());
        }
    }
}
