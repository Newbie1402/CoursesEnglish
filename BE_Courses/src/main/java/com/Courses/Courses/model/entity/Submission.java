package com.Courses.Courses.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Student student;

    @ManyToOne
    private Exam exam;

    private Double score;

    @Column(columnDefinition = "TEXT")
    private String teacherFeedback;

    private LocalDateTime submittedAt;

    // Thời điểm học sinh bắt đầu làm bài
    private LocalDateTime startedAt;
    // Thời điểm deadline kết thúc bài kiểm tra cá nhân
    private LocalDateTime deadline;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL)
    private List<SubmissionAnswer> answers;
}
