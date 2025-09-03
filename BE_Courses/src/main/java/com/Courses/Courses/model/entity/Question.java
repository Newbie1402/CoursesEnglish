package com.Courses.Courses.model.entity;

import com.Courses.Courses.enums.QuestionType;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private QuestionType type;

    private String correctAnswer;

    @ElementCollection
    private List<String> options;

    private boolean isShufflable;

    private Double maxScore;

    @ManyToOne
    @JsonBackReference("exam-questions")
    private Exam exam;
}
