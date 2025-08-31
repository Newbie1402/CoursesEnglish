package com.Courses.Courses.service;

import com.Courses.Courses.enums.QuestionType;
import com.Courses.Courses.enums.StatusApplication;
import com.Courses.Courses.model.dto.ExamDto;
import com.Courses.Courses.model.entity.*;
import com.Courses.Courses.model.request.ExamCreateRequest;
import com.Courses.Courses.model.request.ExamUpdateRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class ExamService {
    private static final Logger log = LoggerFactory.getLogger(ExamService.class);

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
    @Autowired
    private QuestionRepository questionRepository;
    @Autowired
    private TeacherRepository teacherRepository;
    @Autowired
    private NotificationService notificationService;

    /**
     * Tạo mới bài kiểm tra
     */
    @Transactional
    public ExamDto createExam(ExamCreateRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học với ID: " + request.getCourseId()));

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
        Exam savedExam = examRepository.save(exam);
        notificationService.notifyExamCreated(
                course.getTeacher().getId(),
                savedExam.getId(),
                savedExam.getTitle()
        );

        return convertToDto(savedExam);
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
        exam.setDurationMinutes(request.getDurationMinutes());
        exam.setDescription(request.getDescription());
        exam.setPassword(request.getPassword());
        Exam updatedExam = examRepository.save(exam);
        notificationService.notifyExamUpdated(
                updatedExam.getCourse().getTeacher().getId(),
                updatedExam.getId(),
                updatedExam.getTitle()
        );

        return convertToDto(updatedExam);
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
    public void startExam(Long examId, Long studentId, String password) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài kiểm tra với id: " + examId));

        // Kiểm tra mật khẩu nếu bài kiểm tra có yêu cầu
        if (exam.getPassword() != null && !exam.getPassword().isEmpty()) {
            if (password == null || !exam.getPassword().equals(password)) {
                throw new RuntimeException("Mật khẩu không đúng!");
            }
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với id: " + studentId));

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(exam.getStartTime())) {
            throw new RuntimeException("Chưa đến thời gian làm bài!");
        }

        if (now.isAfter(exam.getEndTime())) {
            throw new RuntimeException("Đã hết thời gian làm bài!");
        }

        // Kiểm tra nếu học sinh đã bắt đầu làm bài rồi
        String redisKey = "exam:" + examId + ":student:" + studentId;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(redisKey))) {
            Long ttl = redisTemplate.getExpire(redisKey, TimeUnit.SECONDS);
            if (ttl != null && ttl > 0) {
                throw new RuntimeException("Bạn đã bắt đầu làm bài này rồi. Thời gian còn lại: "
                        + (ttl / 60) + " phút " + (ttl % 60) + " giây");
            }
        }

        LocalDateTime deadline = now.plusMinutes(exam.getDurationMinutes());
        if (deadline.isAfter(exam.getEndTime())) {
            deadline = exam.getEndTime();
        }
        long ttl = Duration.between(now, deadline).toMinutes();

        // Lưu thông tin vào Redis
        redisTemplate.opsForValue().set(redisKey, "doing", ttl, TimeUnit.MINUTES);

        // Tìm Submission theo examId và studentId, nếu chưa có thì tạo mới
        Submission submission = submissionRepository.findByExamIdAndStudentId(examId, studentId)
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

    /**
     * Học sinh hoàn thành bài kiểm tra và tự động chấm điểm các câu trắc nghiệm
     */
    @Transactional
    public double finishExam(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài nộp với id: " + submissionId));

        // Kiểm tra xem học sinh có đang làm bài không
        if (!isStudentDoingExam(submission.getExam().getId(), submission.getStudent().getId())) {
            throw new RuntimeException("Bạn đã hết thời gian làm bài hoặc chưa bắt đầu làm bài!");
        }

        // Đánh dấu thời điểm nộp bài
        submission.setSubmittedAt(LocalDateTime.now());

        // Tự động chấm điểm cho câu trắc nghiệm
        double totalScore = 0;
        double maxScore = 0;

        for (SubmissionAnswer answer : submission.getAnswers()) {
            Question question = answer.getQuestion();
            maxScore += question.getMaxScore();

            // Nếu là câu trắc nghiệm, tự động chấm điểm
            if (question.getType() == QuestionType.MULTIPLE_CHOICE) {
                boolean isCorrect = Objects.equals(answer.getStudentAnswer(), question.getCorrectAnswer());
                answer.setIsCorrect(isCorrect);

                if (isCorrect) {
                    answer.setScore(question.getMaxScore());
                    totalScore += question.getMaxScore();
                } else {
                    answer.setScore(0.0);
                }
            }
            // Nếu là câu tự luận, đánh dấu để giáo viên chấm sau
            else {
                answer.setIsCorrect(null);  // Chưa xác định đúng/sai
                answer.setScore(null);      // Điểm sẽ do giáo viên nhập sau
            }
        }

        // Xóa key Redis để đánh dấu đã hoàn thành bài thi
        String redisKey = "exam:" + submission.getExam().getId() + ":student:" + submission.getStudent().getId();
        redisTemplate.delete(redisKey);

        submissionRepository.save(submission);
        notificationService.notifyExamResult(
                submission.getExam().getCourse().getTeacher().getId(),
                submission.getExam().getId(),
                submission.getExam().getTitle(),
                submission.getStudent().getUser().getFullName(),
                totalScore
        );

        return totalScore;
    }

    /**
     * Giáo viên chấm điểm phần tự luận
     */
    @Transactional
    public void gradeEssayQuestion(Long answerId, Double score, String feedback) {
        SubmissionAnswer answer = submissionRepository.findAnswerById(answerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu trả lời với id: " + answerId));

        if (answer.getQuestion().getType() != QuestionType.ESSAY) {
            throw new RuntimeException("Đây không phải câu hỏi tự luận!");
        }

        // Cập nhật điểm và feedback
        answer.setScore(score);
        answer.setTeacherFeedback(feedback);

        if (score > 0) {
            answer.setIsCorrect(true);
        } else {
            answer.setIsCorrect(false);
        }
        Submission submission = answer.getSubmission();
        updateSubmissionTotalScore(submission);
    }

    /**
     * Cập nhật tổng điểm cho bài nộp
     */
    private void updateSubmissionTotalScore(Submission submission) {
        double totalScore = 0;
        double maxScore = 0;
        int gradedQuestions = 0;
        int totalQuestions = 0;

        for (SubmissionAnswer answer : submission.getAnswers()) {
            Question question = answer.getQuestion();
            totalQuestions++;
            maxScore += question.getMaxScore();

            // Nếu câu hỏi đã được chấm điểm
            if (answer.getScore() != null) {
                totalScore += answer.getScore();
                gradedQuestions++;
            }
        }

        // Chỉ cập nhật điểm tổng nếu tất cả câu hỏi đã được chấm
        if (gradedQuestions == totalQuestions) {
            submission.setScore(totalScore);
            submission.setMaxScore(maxScore);
            submission.setGradedAt(LocalDateTime.now());
        }

        submissionRepository.save(submission);
    }

    /**
     * Lấy danh sách tất cả bài kiểm tra của giáo viên (bao gồm cả active/inactive)
     */
    @Transactional(readOnly = true)
    public ResponseEntity<ResponseData<List<ExamDto>>> getExamsByTeacherId(Long teacherId) {
        try {
            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy giáo viên với id: " + teacherId));

            log.info("Tìm kiếm bài kiểm tra cho giáo viên ID: {}", teacherId);

            List<Exam> exams = examRepository.findByTeacherId(teacherId);
            List<ExamDto> examDtos = exams.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(
                    new ResponseData<>(
                            StatusApplication.SUCCESS.getCode(),
                            "Lấy danh sách " + examDtos.size() + " bài kiểm tra của giáo viên thành công",
                            examDtos
                    )
            );
        } catch (Exception e) {
            log.error("Lỗi khi lấy bài kiểm tra theo giáo viên: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ResponseData<>(
                            StatusApplication.INTERNAL_SERVER_ERROR.getCode(),
                            "Lỗi khi lấy danh sách bài kiểm tra: " + e.getMessage(),
                            null
                    )
            );
        }
    }

    /**
     * Lấy danh sách bài kiểm tra đang active của giáo viên
     */
    @Transactional(readOnly = true)
    public ResponseEntity<ResponseData<List<ExamDto>>> getActiveExamsByTeacherId(Long teacherId) {
        try {
            // Kiểm tra giáo viên có tồn tại không
            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy giáo viên với id: " + teacherId));

            log.info("Tìm kiếm bài kiểm tra active cho giáo viên ID: {}", teacherId);

            List<Exam> exams = examRepository.findActiveByTeacherId(teacherId);
            List<ExamDto> examDtos = exams.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(
                    new ResponseData<>(
                            StatusApplication.SUCCESS.getCode(),
                            "Lấy danh sách " + examDtos.size() + " bài kiểm tra đang hoạt động của giáo viên thành công",
                            examDtos
                    )
            );
        } catch (Exception e) {
            log.error("Lỗi khi lấy bài kiểm tra active theo giáo viên: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ResponseData<>(
                            StatusApplication.INTERNAL_SERVER_ERROR.getCode(),
                            "Lỗi khi lấy danh sách bài kiểm tra: " + e.getMessage(),
                            null
                    )
            );
        }
    }

    /**
     * Lấy danh sách bài kiểm tra theo ID khóa học (cả active và inactive)
     */
    @Transactional(readOnly = true)
    public ResponseEntity<ResponseData<List<ExamDto>>> getExamsByCourseId(Long courseId) {
        try {
            // Kiểm tra khóa học có tồn tại không
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học với id: " + courseId));

            log.info("Tìm kiếm bài kiểm tra cho khóa học ID: {}", courseId);

            List<Exam> exams = examRepository.findByCourseId(courseId);
            List<ExamDto> examDtos = exams.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(
                    new ResponseData<>(
                            StatusApplication.SUCCESS.getCode(),
                            "Lấy danh sách " + examDtos.size() + " bài kiểm tra của khóa học thành công",
                            examDtos
                    )
            );
        } catch (Exception e) {
            log.error("Lỗi khi lấy bài kiểm tra theo khóa học: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ResponseData<>(
                            StatusApplication.INTERNAL_SERVER_ERROR.getCode(),
                            "Lỗi khi lấy danh sách bài kiểm tra: " + e.getMessage(),
                            null
                    )
            );
        }
    }

    /**
     * Lấy danh sách bài kiểm tra đang active theo ID khóa học
     */
    @Transactional(readOnly = true)
    public ResponseEntity<ResponseData<List<ExamDto>>> getActiveExamsByCourseId(Long courseId) {
        try {
            // Kiểm tra khóa học có tồn tại không
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học với id: " + courseId));

            log.info("Tìm kiếm bài kiểm tra active cho khóa học ID: {}", courseId);

            List<Exam> exams = examRepository.findByCourseIdAndActiveTrue(courseId);
            List<ExamDto> examDtos = exams.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(
                    new ResponseData<>(
                            StatusApplication.SUCCESS.getCode(),
                            "Lấy danh sách " + examDtos.size() + " bài kiểm tra đang hoạt động của khóa học thành công",
                            examDtos
                    )
            );
        } catch (Exception e) {
            log.error("Lỗi khi lấy bài kiểm tra active theo khóa học: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ResponseData<>(
                            StatusApplication.INTERNAL_SERVER_ERROR.getCode(),
                            "Lỗi khi lấy danh sách bài kiểm tra: " + e.getMessage(),
                            null
                    )
            );
        }
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
