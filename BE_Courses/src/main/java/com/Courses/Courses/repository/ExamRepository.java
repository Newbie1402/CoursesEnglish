package com.Courses.Courses.repository;

import com.Courses.Courses.model.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    @Query("SELECT e FROM Exam e JOIN e.course c WHERE c.teacher.id = :teacherId")
    List<Exam> findByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT e FROM Exam e JOIN e.course c WHERE c.teacher.id = :teacherId AND e.active = true")
    List<Exam> findActiveByTeacherId(@Param("teacherId") Long teacherId);
}
