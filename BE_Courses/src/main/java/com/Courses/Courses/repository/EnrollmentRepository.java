package com.Courses.Courses.repository;

import com.Courses.Courses.model.entity.Course;
import com.Courses.Courses.model.entity.Enrollment;
import com.Courses.Courses.model.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByCourseId(Long courseId);
    List<Enrollment> findByStudentId(Long studentId);
    Optional<Enrollment> findByStudentAndCourse(Student student, Course course);
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
}
