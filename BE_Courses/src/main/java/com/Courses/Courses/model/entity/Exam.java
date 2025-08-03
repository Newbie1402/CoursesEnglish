package com.Courses.Courses.model.entity;

import com.Courses.Courses.enums.ExamType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
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
    private ExamType type; // MULTIPLE_CHOICE, WRITING

    @ManyToOne
    private Course course;

    private LocalDate startTime;
    private LocalDate endTime;

    @OneToMany(mappedBy = "exam")
    private List<Question> questions;

    @OneToMany(mappedBy = "exam")
    private List<Submission> submissions;
}
