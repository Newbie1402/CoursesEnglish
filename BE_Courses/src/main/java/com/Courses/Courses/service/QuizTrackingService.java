package com.Courses.Courses.service;

import com.Courses.Courses.enums.ActionType;
import com.Courses.Courses.model.dto.QuizChoiceActionDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
@RequiredArgsConstructor
public class QuizTrackingService {

    private static final String TOPIC_NAME = "quiz.choice.tracking.v1";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Ghi nhận hành động chọn một đáp án
     * @param userId ID của học sinh
     * @param quizId ID của bài quiz
     * @param questionId ID của câu hỏi
     * @param choiceId ID của đáp án được chọn
     * @param choiceIndex Vị trí của đáp án trong danh sách
     * @param currentChoices Danh sách ID các đáp án hiện tại đã chọn
     * @return CompletableFuture<Void> đại diện cho việc hoàn thành ghi log
     */
    public CompletableFuture<Void> trackSelectChoice(
            Long userId, Long quizId, Long questionId,
            Long choiceId, Integer choiceIndex, List<Long> currentChoices) {

        return trackAction(userId, quizId, questionId, choiceId, choiceIndex, currentChoices, ActionType.SELECT);
    }

    /**
     * Ghi nhận hành động bỏ chọn một đáp án
     * @param userId ID của học sinh
     * @param quizId ID của bài quiz
     * @param questionId ID của câu hỏi
     * @param choiceId ID của đáp án bị bỏ chọn
     * @param choiceIndex Vị trí của đáp án trong danh sách
     * @param currentChoices Danh sách ID các đáp án hiện tại đã chọn
     * @return CompletableFuture<Void> đại diện cho việc hoàn thành ghi log
     */
    public CompletableFuture<Void> trackUnselectChoice(
            Long userId, Long quizId, Long questionId,
            Long choiceId, Integer choiceIndex, List<Long> currentChoices) {

        return trackAction(userId, quizId, questionId, choiceId, choiceIndex, currentChoices, ActionType.UNSELECT);
    }

    /**
     * Ghi nhận hành động nộp bài (submit) cho một câu hỏi
     * @param userId ID của học sinh
     * @param quizId ID của bài quiz
     * @param questionId ID của câu hỏi
     * @param currentChoices Danh sách ID các đáp án đã chọn khi nộp bài
     * @return CompletableFuture<Void> đại diện cho việc hoàn thành ghi log
     */
    public CompletableFuture<Void> trackSubmitQuestion(
            Long userId, Long quizId, Long questionId, List<Long> currentChoices) {

        return trackAction(userId, quizId, questionId, null, -1, currentChoices, ActionType.SUBMIT);
    }

    /**
     * Phương thức chung để ghi nhận mọi loại hành động
     */
    private CompletableFuture<Void> trackAction(
            Long userId, Long quizId, Long questionId,
            Long choiceId, Integer choiceIndex, List<Long> currentChoices,
            ActionType actionType) {

        QuizChoiceActionDto actionDto = QuizChoiceActionDto.createNew(
                userId, quizId, questionId, actionType, choiceId, choiceIndex, currentChoices);

        String key = actionDto.generateKafkaKey();

        log.debug("Gửi tracking log tới Kafka - key: {}, actionType: {}, user: {}, quiz: {}, question: {}",
                key, actionType, userId, quizId, questionId);

        return CompletableFuture.runAsync(() -> {
            try {
                kafkaTemplate.send(TOPIC_NAME, key, actionDto).get();
                log.debug("Đã gửi tracking log tới Kafka thành công");
            } catch (Exception e) {
                log.error("Lỗi khi gửi tracking log tới Kafka: {}", e.getMessage(), e);
            }
        });
    }
}
