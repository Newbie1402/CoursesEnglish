package com.Courses.Courses.repository;

import com.Courses.Courses.model.entity.Submission;
import com.Courses.Courses.model.entity.SubmissionAnswer;
import com.Courses.Courses.model.entity.Exam;
import com.Courses.Courses.model.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    Optional<Submission> findByExamAndStudent(Exam exam, Student student);

    @Query("SELECT s FROM Submission s WHERE s.exam.id = :examId AND s.student.id = :studentId")
    Optional<Submission> findByExamIdAndStudentId(@Param("examId") Long examId, @Param("studentId") Long studentId);

    @Query("SELECT s FROM Submission s WHERE s.exam.id = :examId")
    List<Submission> findAllByExamId(@Param("examId") Long examId);

    @Query("SELECT a FROM SubmissionAnswer a WHERE a.id = :answerId")
    Optional<SubmissionAnswer> findAnswerById(@Param("answerId") Long answerId);

    @Modifying
    @Query("UPDATE Submission s SET s.teacherFeedback = :feedback WHERE s.id = :submissionId")
    void updateTeacherFeedback(@Param("submissionId") Long submissionId, @Param("feedback") String feedback);
}
