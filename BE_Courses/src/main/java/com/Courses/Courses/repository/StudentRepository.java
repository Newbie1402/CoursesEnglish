package com.Courses.Courses.repository;

import com.Courses.Courses.model.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long UserId);
    Student findStudentByUser_Id(Long userId);

    @Query("SELECT s FROM Student s JOIN s.enrollments e JOIN e.course c WHERE c.teacher.id = :teacherId")
    List<Student> findAllByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT COUNT(DISTINCT s.id) FROM Student s JOIN s.enrollments e JOIN e.course c WHERE c.teacher.id = :teacherId")
    Long countByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT DISTINCT c.teacher.id FROM Student s JOIN s.enrollments e JOIN e.course c WHERE c.teacher.id IS NOT NULL")
    List<Long> findDistinctTeacherIdsWithStudents();
}
