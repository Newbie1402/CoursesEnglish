package com.Courses.Courses.service;

import com.Courses.Courses.model.dto.ExamDto;
import com.Courses.Courses.model.entity.Course;
import com.Courses.Courses.model.entity.Exam;
import com.Courses.Courses.model.entity.Student;
import com.Courses.Courses.model.entity.Submission;
import com.Courses.Courses.model.request.ExamCreateRequest;
import com.Courses.Courses.model.request.ExamUpdateRequest;
import com.Courses.Courses.repository.CourseRepository;
import com.Courses.Courses.repository.ExamRepository;
import com.Courses.Courses.repository.StudentRepository;
import com.Courses.Courses.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class ExamService {
    @Autowired
    private ExamRepository examRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    @Autowired
    private SubmissionRepository submissionRepository;
    @Autowired
    private StudentRepository studentRepository;

    /**
     * Tạo mới bài kiểm tra
     */
    @Transactional
    public ExamDto createExam(ExamCreateRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoá học với id: " + request.getCourseId()));
        Exam exam = new Exam();
        exam.setTitle(request.getTitle());
        exam.setType(request.getType());
        exam.setCourse(course);
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setDurationMinutes(request.getDurationMinutes());
        exam.setDescription(request.getDescription());
        exam.setPassword(request.getPassword());
        exam.setActive(true);
        examRepository.save(exam);
        return convertToDto(exam);
    }

    /**
     * Lấy toàn bộ bài kiểm tra (bao gồm cả active/inactive)
     */
    public List<ExamDto> getAllExams() {
        return examRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy toàn bộ bài kiểm tra chỉ active
     */
    public List<ExamDto> getAllActiveExams() {
        return examRepository.findAll().stream()
                .filter(Exam::getActive)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Sửa thông tin bài kiểm tra
     */
    @Transactional
    public ExamDto updateExam(ExamUpdateRequest request) {
        Exam exam = examRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài kiểm tra với id: " + request.getId()));
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoá học với id: " + request.getCourseId()));
        exam.setTitle(request.getTitle());
        exam.setType(request.getType());
        exam.setCourse(course);
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setDescription(request.getDescription());
        exam.setPassword(request.getPassword());
        examRepository.save(exam);
        return convertToDto(exam);
    }

    /**
     * Đổi trạng thái active/inactive cho bài kiểm tra
     */
    @Transactional
    public ExamDto setExamActive(Long id, boolean active) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài kiểm tra với id: " + id));
        exam.setActive(active);
        examRepository.save(exam);
        return convertToDto(exam);
    }

    /**
     * Lấy chi tiết 1 bài kiểm tra
     */
    public ExamDto getExamById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài kiểm tra với id: " + id));
        return convertToDto(exam);
    }

    /**
     * Học sinh bắt đầu làm bài kiểm tra
     * Lưu trạng thái làm bài vào Redis và cập nhật Submission
     */
    @Transactional
    public void startExam(Long examId, Long studentId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài kiểm tra với id: " + examId));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với id: " + studentId));
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(exam.getStartTime()) || now.isAfter(exam.getEndTime())) {
            throw new RuntimeException("Chưa đến thời gian làm bài hoặc đã hết thời gian làm bài!");
        }
        LocalDateTime deadline = now.plusMinutes(exam.getDurationMinutes());
        if (deadline.isAfter(exam.getEndTime())) {
            deadline = exam.getEndTime();
        }
        long ttl = Duration.between(now, deadline).toMinutes();
        String redisKey = "exam:" + examId + ":student:" + studentId;
        redisTemplate.opsForValue().set(redisKey, "doing", ttl, TimeUnit.MINUTES);
        // Tìm Submission theo examId và studentId, nếu chưa có thì tạo mới
        Submission submission = submissionRepository.findByExamAndStudent(exam, student)
                .orElseGet(() -> {
                    Submission newSubmission = new Submission();
                    newSubmission.setExam(exam);
                    newSubmission.setStudent(student);
                    return newSubmission;
                });
        submission.setStartedAt(now);
        submission.setDeadline(deadline);
        submissionRepository.save(submission);
    }

    /**
     * Kiểm tra học sinh còn làm bài được không (dựa vào Redis TTL)
     * @return true nếu còn làm bài được, false nếu đã hết thời gian
     */
    public boolean isStudentDoingExam(Long examId, Long studentId) {
        String redisKey = "exam:" + examId + ":student:" + studentId;
        Long ttl = redisTemplate.getExpire(redisKey, TimeUnit.SECONDS);
        return ttl != null && ttl > 0;
    }

    private ExamDto convertToDto(Exam exam) {
        return ExamDto.builder()
                .examId(exam.getId())
                .title(exam.getTitle())
                .type(exam.getType())
                .courseId(exam.getCourse() != null ? exam.getCourse().getId() : null)
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .durationMinutes(exam.getDurationMinutes())
                .description(exam.getDescription())
                .password(exam.getPassword())
                .active(exam.getActive())
                .build();
    }
}
