package com.Courses.Courses.model.entity;

import com.Courses.Courses.enums.DayOfWeek;
import com.Courses.Courses.enums.TimeSlot;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WorkSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @NotNull(message = "không được để trống")
    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;


    @NotNull(message = "Thứ trong tuần không được để trống")
    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Ngày làm việc không được để trống")
    @FutureOrPresent(message = "Ngày làm việc phải là hôm nay hoặc tương lai")
    @Column(nullable = false)
    private LocalDate date;

    @NotEmpty(message = "Phải chọn ít nhất một khung giờ")
    @ElementCollection(targetClass = TimeSlot.class)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Set<TimeSlot> timeSlot;

    @Column(nullable = false)
    private boolean available;
}
