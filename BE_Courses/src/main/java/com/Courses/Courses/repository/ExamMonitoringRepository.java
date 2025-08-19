package com.Courses.Courses.repository;

import com.Courses.Courses.model.entity.ExamMonitoringEvent;
import com.Courses.Courses.enums.MonitoringEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExamMonitoringRepository extends JpaRepository<ExamMonitoringEvent, Long> {

    List<ExamMonitoringEvent> findByExamIdAndStudentIdOrderByCreatedAtDesc(Long examId, Long studentId);

    List<ExamMonitoringEvent> findBySubmissionIdOrderByCreatedAtDesc(Long submissionId);

    @Query("SELECT e FROM ExamMonitoringEvent e WHERE e.exam.id = :examId AND e.student.id = :studentId AND e.eventType = :eventType AND e.createdAt >= :startTime")
    List<ExamMonitoringEvent> findRecentEventsByType(
            @Param("examId") Long examId,
            @Param("studentId") Long studentId,
            @Param("eventType") MonitoringEventType eventType,
            @Param("startTime") LocalDateTime startTime);

    @Query("SELECT COUNT(e) FROM ExamMonitoringEvent e WHERE e.submission.id = :submissionId AND e.eventType = :eventType")
    long countEventsBySubmissionIdAndType(
            @Param("submissionId") Long submissionId,
            @Param("eventType") MonitoringEventType eventType);

    @Query("SELECT e FROM ExamMonitoringEvent e WHERE e.exam.id = :examId AND e.isResolved = false ORDER BY e.createdAt DESC")
    List<ExamMonitoringEvent> findUnresolvedEventsByExamId(@Param("examId") Long examId);
}
