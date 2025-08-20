package com.Courses.Courses.service;

import com.Courses.Courses.model.dto.QuizChoiceActionDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.concurrent.CountDownLatch;

/**
 * Service để xử lý các sự kiện tracking chọn đáp án từ Kafka
 * Sử dụng để phân tích và lưu trữ hành vi chọn đáp án của học sinh
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class QuizChoiceConsumerService {

    private CountDownLatch latch = new CountDownLatch(1); // Chỉ dùng cho testing
    private QuizChoiceActionDto receivedAction;

    /**
     * Lắng nghe và xử lý các sự kiện hành động chọn đáp án từ topic Kafka
     */
    @KafkaListener(topics = "quiz.choice.tracking.v1", groupId = "quiz_tracking_group")
    public void consume(QuizChoiceActionDto actionDto) {
        log.info("Nhận được sự kiện hành động đáp án: {}", actionDto);

        try {
            analyzeChoiceAction(actionDto);
            receivedAction = actionDto;
            latch.countDown(); // Chỉ dùng cho testing
        } catch (Exception e) {
            log.error("Lỗi khi xử lý sự kiện hành động đáp án: {}", e.getMessage(), e);
        }
    }

    /**
     * Phân tích hành động chọn đáp án để tìm ra insight
     *
     * @param actionDto DTO chứa thông tin về hành động chọn đáp án
     */
    private void analyzeChoiceAction(QuizChoiceActionDto actionDto) {
        switch (actionDto.getActionType()) {
            case SELECT:
                log.debug("Học sinh {} đã chọn đáp án {} cho câu hỏi {}",
                        actionDto.getUserId(), actionDto.getChoiceId(), actionDto.getQuestionId());
                break;
            case UNSELECT:
                log.debug("Học sinh {} đã bỏ chọn đáp án {} cho câu hỏi {}",
                        actionDto.getUserId(), actionDto.getChoiceId(), actionDto.getQuestionId());
                break;
            case SUBMIT:
                log.debug("Học sinh {} đã nộp bài cho câu hỏi {} với các lựa chọn: {}",
                        actionDto.getUserId(), actionDto.getQuestionId(), actionDto.getCurrentChoices());
                break;
        }

    }

    public void resetLatch() {
        latch = new CountDownLatch(1);
    }

    public CountDownLatch getLatch() {
        return latch;
    }

    public QuizChoiceActionDto getReceivedAction() {
        return receivedAction;
    }
}
