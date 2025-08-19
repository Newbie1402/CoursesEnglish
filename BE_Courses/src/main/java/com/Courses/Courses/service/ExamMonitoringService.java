package com.Courses.Courses.service;

import com.Courses.Courses.model.dto.MonitoringEventDto;
import com.Courses.Courses.model.dto.MonitoringEventResponseDto;
import com.Courses.Courses.model.entity.Exam;
import com.Courses.Courses.model.entity.ExamMonitoringEvent;
import com.Courses.Courses.model.entity.Student;
import com.Courses.Courses.model.entity.Submission;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.enums.MonitoringEventType;
import com.Courses.Courses.enums.StatusApplication;
import com.Courses.Courses.repository.ExamMonitoringRepository;
import com.Courses.Courses.repository.ExamRepository;
import com.Courses.Courses.repository.StudentRepository;
import com.Courses.Courses.repository.SubmissionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExamMonitoringService {
    private static final Logger log = LoggerFactory.getLogger(ExamMonitoringService.class);

    private final ExamMonitoringRepository examMonitoringRepository;
    private final ExamRepository examRepository;
    private final StudentRepository studentRepository;
    private final SubmissionRepository submissionRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    public ExamMonitoringService(
            ExamMonitoringRepository examMonitoringRepository,
            ExamRepository examRepository,
            StudentRepository studentRepository,
            SubmissionRepository submissionRepository,
            KafkaTemplate<String, Object> kafkaTemplate) {
        this.examMonitoringRepository = examMonitoringRepository;
        this.examRepository = examRepository;
        this.studentRepository = studentRepository;
        this.submissionRepository = submissionRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Gửi sự kiện giám sát vào Kafka
     */
    public ResponseEntity<ResponseData<Void>> sendMonitoringEvent(MonitoringEventDto eventDto) {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (eventDto.getExamId() == null || eventDto.getStudentId() == null) {
                return ResponseEntity.badRequest().body(
                    new ResponseData<>(
                        StatusApplication.BAD_REQUEST.getCode(),
                        "examId và studentId không được để trống",
                        null
                    )
                );
            }

            log.info("Nhận sự kiện giám sát: {} từ học sinh {} trong bài kiểm tra {}",
                    eventDto.getEventType(), eventDto.getStudentId(), eventDto.getExamId());

            // Đảm bảo timestamp có giá trị
            if (eventDto.getTimestamp() == null) {
                eventDto.setTimestamp(LocalDateTime.now());
            }

            // Gửi sự kiện vào Kafka để xử lý bất đồng bộ
            kafkaTemplate.send("exam-monitoring", eventDto);

            return ResponseEntity.ok(
                new ResponseData<>(
                    StatusApplication.SUCCESS.getCode(),
                    "Sự kiện giám sát đã được ghi nhận",
                    null
                )
            );
        } catch (Exception e) {
            log.error("Lỗi khi xử lý sự kiện giám sát: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ResponseData<>(
                    StatusApplication.INTERNAL_SERVER_ERROR.getCode(),
                    "Lỗi khi xử lý sự kiện giám sát: " + e.getMessage(),
                    null
                )
            );
        }
    }

    /**
     * Lưu sự kiện giám sát vào cơ sở dữ liệu và kiểm tra các quy tắc gian lận
     */
    @Transactional
    public void processMonitoringEvent(MonitoringEventDto eventDto) {
        try {
            // Tìm kiếm học sinh và bài kiểm tra
            Student student = studentRepository.findById(eventDto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với ID: " + eventDto.getStudentId()));

            Exam exam = examRepository.findById(eventDto.getExamId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài kiểm tra với ID: " + eventDto.getExamId()));

            Submission submission = null;
            if (eventDto.getSubmissionId() != null) {
                submission = submissionRepository.findById(eventDto.getSubmissionId())
                    .orElse(null);
            }

            // Nếu không có submissionId, tìm submission theo examId và studentId
            if (submission == null) {
                submission = submissionRepository.findByExamIdAndStudentId(eventDto.getExamId(), eventDto.getStudentId())
                    .orElse(null);
            }

            // Tạo và lưu sự kiện giám sát
            ExamMonitoringEvent event = ExamMonitoringEvent.builder()
                .student(student)
                .exam(exam)
                .submission(submission)
                .eventType(eventDto.getEventType())
                .eventDetail(eventDto.getEventDetail())
                .isResolved(false)
                .createdAt(eventDto.getTimestamp() != null ? eventDto.getTimestamp() : LocalDateTime.now())
                .build();

            examMonitoringRepository.save(event);

            // Kiểm tra các quy tắc gian lận và gửi cảnh báo nếu cần
            checkCheatingRules(event);

        } catch (Exception e) {
            log.error("Lỗi khi xử lý sự kiện giám sát: {}", e.getMessage(), e);
        }
    }

    /**
     * Kiểm tra các quy tắc gian lận dựa trên sự kiện giám sát
     */
    private void checkCheatingRules(ExamMonitoringEvent event) {
        // Kiểm tra số lần chuyển tab trong khoảng thời gian ngắn
        if (event.getEventType() == MonitoringEventType.WINDOW_BLUR) {
            LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
            List<ExamMonitoringEvent> recentEvents = examMonitoringRepository.findRecentEventsByType(
                event.getExam().getId(),
                event.getStudent().getId(),
                MonitoringEventType.WINDOW_BLUR,
                fiveMinutesAgo
            );

            if (recentEvents.size() >= 3) {
                // Gửi cảnh báo nếu học sinh chuyển tab quá nhiều lần trong 5 phút
                sendAlert(event, "Học sinh chuyển tab quá nhiều lần trong thời gian ngắn");
            }
        }

        // Kiểm tra nếu phát hiện chụp màn hình
        if (event.getEventType() == MonitoringEventType.SCREENSHOT_DETECTED) {
            sendAlert(event, "Phát hiện học sinh chụp màn hình trong bài kiểm tra");
        }

        // Kiểm tra nếu phát hiện copy/paste
        if (event.getEventType() == MonitoringEventType.COPY_DETECTED ||
            event.getEventType() == MonitoringEventType.PASTE_DETECTED) {
            sendAlert(event, "Phát hiện hành vi sao chép/dán trong bài kiểm tra");
        }
    }

    /**
     * Gửi cảnh báo về hành vi đáng ngờ
     */
    private void sendAlert(ExamMonitoringEvent event, String alertMessage) {
        Map<String, Object> alert = Map.of(
            "eventId", event.getId(),
            "examId", event.getExam().getId(),
            "examTitle", event.getExam().getTitle(),
            "studentId", event.getStudent().getId(),
            "studentName", event.getStudent().getUser().getFullName(),
            "eventType", event.getEventType(),
            "timestamp", event.getCreatedAt(),
            "alertMessage", alertMessage
        );

        log.warn("CẢNH BÁO GIAN LẬN: {} - Học sinh: {} (ID: {}), Bài kiểm tra: {} (ID: {})",
                alertMessage,
                event.getStudent().getUser().getFullName(),
                event.getStudent().getId(),
                event.getExam().getTitle(),
                event.getExam().getId());

        // Gửi cảnh báo vào Kafka để xử lý (thông báo cho giáo viên, lưu log, v.v.)
        kafkaTemplate.send("exam-alerts", alert);
    }

    /**
     * Lấy danh sách sự kiện giám sát của một học sinh trong bài kiểm tra
     */
    public List<MonitoringEventResponseDto> getMonitoringEventsDtoByExamAndStudent(Long examId, Long studentId) {
        List<ExamMonitoringEvent> events = examMonitoringRepository.findByExamIdAndStudentIdOrderByCreatedAtDesc(examId, studentId);
        return events.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách các sự kiện giám sát chưa được giải quyết trong một bài kiểm tra
     */
    public List<MonitoringEventResponseDto> getUnresolvedEventsDto(Long examId) {
        List<ExamMonitoringEvent> events = examMonitoringRepository.findUnresolvedEventsByExamId(examId);
        return events.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }


    private MonitoringEventResponseDto convertToDto(ExamMonitoringEvent event) {
        return MonitoringEventResponseDto.builder()
                .id(event.getId())
                .studentId(event.getStudent() != null ? event.getStudent().getId() : null)
                .studentName(event.getStudent() != null && event.getStudent().getUser() != null ?
                        event.getStudent().getUser().getFullName() : null)
                .studentEmail(event.getStudent() != null && event.getStudent().getUser() != null ?
                        event.getStudent().getUser().getEmail() : null)
                .examId(event.getExam() != null ? event.getExam().getId() : null)
                .examTitle(event.getExam() != null ? event.getExam().getTitle() : null)
                .submissionId(event.getSubmission() != null ? event.getSubmission().getId() : null)
                .eventType(event.getEventType())
                .eventDetail(event.getEventDetail())
                .createdAt(event.getCreatedAt())
                .isResolved(event.isResolved())
                .resolution(event.getResolution())
                .resolvedAt(event.getResolvedAt())
                .build();
    }

    /**
     * Lấy danh sách sự kiện giám sát của một học sinh trong bài kiểm tra
     */
    public List<ExamMonitoringEvent> getMonitoringEventsByExamAndStudent(Long examId, Long studentId) {
        return examMonitoringRepository.findByExamIdAndStudentIdOrderByCreatedAtDesc(examId, studentId);
    }

    /**
     * Lấy danh sách các sự kiện giám sát chưa được giải quyết trong một bài kiểm tra
     */
    public List<ExamMonitoringEvent> getUnresolvedEvents(Long examId) {
        return examMonitoringRepository.findUnresolvedEventsByExamId(examId);
    }

    /**
     * Đánh dấu sự kiện giám sát đã được giải quyết
     */
    @Transactional
    public void resolveEvent(Long eventId, Long resolvedBy, String resolveNote) {
        ExamMonitoringEvent event = examMonitoringRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện giám sát với ID: " + eventId));

        event.setResolved(true);
        event.setResolution(resolveNote);
        event.setResolvedAt(LocalDateTime.now());


        log.info("Sự kiện ID {} đã được giải quyết bởi giáo viên ID {}: {}",
                eventId, resolvedBy, resolveNote);

        examMonitoringRepository.save(event);
    }
}
