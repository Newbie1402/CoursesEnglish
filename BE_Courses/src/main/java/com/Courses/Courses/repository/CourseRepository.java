package com.Courses.Courses.repository;

import com.Courses.Courses.model.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByTeacherIdAndActiveTrue(Long teacherId);
}
