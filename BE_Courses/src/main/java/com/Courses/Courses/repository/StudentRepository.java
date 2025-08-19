package com.Courses.Courses.repository;

import com.Courses.Courses.model.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long UserId);
    Student findStudentByUser_Id(Long userId);
}
