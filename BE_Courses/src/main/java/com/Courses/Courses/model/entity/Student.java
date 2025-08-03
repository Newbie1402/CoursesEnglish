package com.Courses.Courses.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
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
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private Users user;

    private String parentName;
    private String parentPhone;
    private String application;

    @OneToMany(mappedBy = "student")
    private List<Enrollment> enrollments;

    @OneToMany(mappedBy = "student")
    private List<Attendance> attendanceRecords;

    @OneToMany(mappedBy = "student")
    private List<Submission> submissions;

//    @OneToMany(mappedBy = "student")
//    private List<StudentRating> teacherRatings;
//
//    @OneToMany(mappedBy = "student")
//    private List<Notification> notifications;
}
