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

    @NotNull(message = "Người dùng không được để trống")
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", unique = true)
    private Users user;

    @NotNull(message = "Tên cha không được để trống")
    @Size(min = 3, max = 100, message = "Tên cha phải có độ dài từ 3 đến 100 ký tự")
    private String fatherName;

    private String fatherPhone;

    @NotNull(message = "Tên mẹ không được để trống")
    @Size(min = 3, max = 100, message = "Tên mẹ phải có độ dài từ 3 đến 100 ký tự")
    private String motherName;

    private String motherPhone;

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
