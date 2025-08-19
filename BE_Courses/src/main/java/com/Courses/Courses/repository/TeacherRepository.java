package com.Courses.Courses.repository;

import com.Courses.Courses.model.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Teacher findTeacherByUser_Id(Long userId);
    boolean existsByUser_Id(Long userId);
}
