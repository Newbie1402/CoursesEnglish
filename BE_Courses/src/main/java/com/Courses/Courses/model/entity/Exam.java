package com.Courses.Courses.model.entity;

import com.Courses.Courses.enums.ExamType;
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
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    @Enumerated(EnumType.STRING)
    private ExamType type; // MULTIPLE_CHOICE, WRITING

    @ManyToOne
    private Course course;

    // Thời gian bắt đầu bài kiểm tra (giờ/phút)
    private LocalDateTime startTime;
    // Thời gian kết thúc bài kiểm tra (giờ/phút)
    private LocalDateTime endTime;
    // Thời lượng làm bài (phút)
    private Integer durationMinutes;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL)
    private List<Question> questions;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL)
    private List<Submission> submissions;

    private String description;
    private String password;
    private Boolean active = true;
}
