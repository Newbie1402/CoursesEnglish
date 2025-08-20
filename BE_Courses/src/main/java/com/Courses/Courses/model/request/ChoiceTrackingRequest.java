package com.Courses.Courses.model.request;

import com.Courses.Courses.enums.ActionType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChoiceTrackingRequest {

    @NotNull(message = "userId không được để trống")
    private Long userId;

    @NotNull(message = "quizId không được để trống")
    private Long quizId;

    @NotNull(message = "questionId không được để trống")
    private Long questionId;

    @NotNull(message = "actionType không được để trống")
    private ActionType actionType;

    private Long choiceId;

    private Integer choiceIndex;

    private List<Long> currentChoices;
}
