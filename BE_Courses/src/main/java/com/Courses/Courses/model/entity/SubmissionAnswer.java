package com.Courses.Courses.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SubmissionAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Submission submission;

    @ManyToOne
    private Question question;

    @Column(columnDefinition = "TEXT")
    private String studentAnswer;

    private Boolean isCorrect; // true / false / null (nếu là ESSAY)

    private Double score; // điểm riêng của câu hỏi
}
