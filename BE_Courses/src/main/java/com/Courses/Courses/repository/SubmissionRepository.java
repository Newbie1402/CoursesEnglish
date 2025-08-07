package com.Courses.Courses.repository;

import com.Courses.Courses.model.entity.Submission;
import com.Courses.Courses.model.entity.Exam;
import com.Courses.Courses.model.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    Optional<Submission> findByExamAndStudent(Exam exam, Student student);
}

