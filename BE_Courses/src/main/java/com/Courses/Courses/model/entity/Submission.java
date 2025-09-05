package com.Courses.Courses.model.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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
    @JsonBackReference("exam-submissions")
    private Exam exam;

    private Double score;
    
    // Điểm tối đa có thể đạt được cho bài nộp
    private Double maxScore;

    private Integer attemptCount = 0;

    @Column(columnDefinition = "TEXT")
    private String teacherFeedback;

    private LocalDateTime submittedAt;

    // Thời điểm học sinh bắt đầu làm bài
    private LocalDateTime startedAt;
    // Thời điểm deadline kết thúc bài kiểm tra cá nhân
    private LocalDateTime deadline;
    // Thời điểm bài kiểm tra được chấm điểm xong
    private LocalDateTime gradedAt;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL)
    @JsonManagedReference("submission-answers")
    private List<SubmissionAnswer> answers;
}
