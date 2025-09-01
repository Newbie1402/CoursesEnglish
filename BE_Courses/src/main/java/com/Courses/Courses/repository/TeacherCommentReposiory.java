package com.Courses.Courses.repository;

import com.Courses.Courses.model.entity.TeacherComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherCommentReposiory extends JpaRepository<TeacherComment, Long> {
    List<TeacherComment> findByStudentIdAndActiveTrue(Long studentId);

    List<TeacherComment> findByTeacherIdAndActiveTrue(Long teacherId);

    List<TeacherComment> findByExamIdAndActiveTrue(Long examId);

    List<TeacherComment> findByQuestionIdAndActiveTrue(Long questionId);

    List<TeacherComment> findByExamIdAndActiveFalse(Long examId);

    List<TeacherComment> findByActiveTrue();

    List<TeacherComment> findByActiveFalse();

    List<TeacherComment> findByStudentIdAndTeacherId(Long studentId, Long teacherId);

    List<TeacherComment> findByStudentIdAndExamId(Long studentId, Long examId);
}
