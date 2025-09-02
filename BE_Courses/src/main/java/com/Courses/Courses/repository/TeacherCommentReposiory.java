package com.Courses.Courses.repository;

import com.Courses.Courses.model.entity.TeacherComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherCommentReposiory extends JpaRepository<TeacherComment, Long> {
    List<TeacherComment> findByActiveTrue();

    List<TeacherComment> findByActiveFalse();

    List<TeacherComment> findByStudentIdAndActiveTrue(Long studentId);

    List<TeacherComment> findByTeacherIdAndActiveTrue(Long teacherId);

    List<TeacherComment> findByExamIdAndActiveTrue(Long examId);

    List<TeacherComment> findByQuestionIdAndActiveTrue(Long questionId);

    List<TeacherComment> findByExamIdAndActiveFalse(Long examId);

    List<TeacherComment> findByStudentIdAndTeacherId(Long studentId, Long teacherId);

    List<TeacherComment> findByStudentIdAndExamId(Long studentId, Long examId);

    @Query("SELECT tc FROM TeacherComment tc WHERE tc.exam.id = :examId AND tc.student.id = :studentId AND tc.active = true ORDER BY tc.commentedAt DESC")
    Optional<TeacherComment> findLatestActiveCommentByExamAndStudent(@Param("examId") Long examId, @Param("studentId") Long studentId);
}
