package com.Courses.Courses.model.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
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
    @JsonBackReference("submission-answers")
    private Submission submission;

    @ManyToOne
    @JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id")
    private Question question;

    @Column(columnDefinition = "TEXT")
    private String studentAnswer;

    private Boolean isCorrect; // true / false / null (nếu là ESSAY)

    private Double score; // điểm riêng của câu hỏi

    @Column(columnDefinition = "TEXT")
    private String teacherFeedback; // phản hồi của giáo viên cho câu trả lời
}
