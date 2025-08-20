package com.Courses.Courses.model.dto;

import com.Courses.Courses.enums.ActionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizChoiceActionDto {

    private String eventId;

    private LocalDateTime occurredAt;

    private Long userId;

    private Long quizId;

    private Long questionId;

    private ActionType actionType;

    private Long choiceId;

    private Integer choiceIndex;

    private List<Long> currentChoices;

    private String traceId;

    public String generateKafkaKey() {
        return userId + "|" + quizId + "|" + questionId;
    }

    public static QuizChoiceActionDto createNew(
            Long userId, Long quizId, Long questionId, ActionType actionType,
            Long choiceId, Integer choiceIndex, List<Long> currentChoices) {

        return QuizChoiceActionDto.builder()
                .eventId(UUID.randomUUID().toString())
                .occurredAt(LocalDateTime.now())
                .userId(userId)
                .quizId(quizId)
                .questionId(questionId)
                .actionType(actionType)
                .choiceId(choiceId)
                .choiceIndex(choiceIndex)
                .currentChoices(currentChoices)
                .traceId(UUID.randomUUID().toString())
                .build();
    }
}
