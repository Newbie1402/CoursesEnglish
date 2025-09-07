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

    @Query(value = "SELECT s.* FROM student s " +
            "INNER JOIN enrollment e ON s.id = e.student_id " +
            "INNER JOIN course c ON e.course_id = c.id " +
            "INNER JOIN exam ex ON ex.course_id = c.id " +
            "WHERE ex.id = :examId " +
            "AND s.id NOT IN (SELECT sub.student_id FROM submission sub WHERE sub.exam_id = :examId)",
            nativeQuery = true)
    List<Student> findStudentsNotAttemptedExam(@Param("examId") Long examId);

    @Query(value = "SELECT s.* FROM student s " +
            "INNER JOIN enrollment e ON s.id = e.student_id " +
            "WHERE e.course_id = :courseId " +
            "AND s.id NOT IN (SELECT sub.student_id FROM submission sub " +
            "INNER JOIN exam ex ON sub.exam_id = ex.id " +
            "WHERE ex.course_id = :courseId)",
            nativeQuery = true)
    List<Student> findStudentsNotAttemptedAnyCourseExams(@Param("courseId") Long courseId);
}
