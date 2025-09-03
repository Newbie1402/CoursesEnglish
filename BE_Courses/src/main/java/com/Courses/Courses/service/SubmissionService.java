package com.Courses.Courses.service;

import com.Courses.Courses.enums.StatusApplication;
import com.Courses.Courses.model.dto.SubmissionDto;
import com.Courses.Courses.model.entity.*;
import com.Courses.Courses.model.request.SubmissionAnswerRequest;
import com.Courses.Courses.model.request.SubmissionCreateRequest;
import com.Courses.Courses.model.request.SubmissionUpdateRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.repository.ExamRepository;
import com.Courses.Courses.repository.QuestionRepository;
import com.Courses.Courses.repository.StudentRepository;
import com.Courses.Courses.repository.SubmissionRepository;
import com.Courses.Courses.repository.TeacherCommentReposiory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class SubmissionService {
    private static final Logger logger = LoggerFactory.getLogger(SubmissionService.class);

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private TeacherCommentReposiory teacherCommentReposiory;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * Lấy tất cả bài làm của một học sinh (chỉ học sinh đó nhìn thấy)
     */
    public ResponseEntity<ResponseData<List<SubmissionDto>>> getAllByStudent(Long studentId) {
        Optional<Student> studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseData<>(404, "Không tìm thấy học sinh với id = " + studentId, null)
            );
        }
        List<SubmissionDto> dtos = submissionRepository.findAll().stream()
                .filter(s -> s.getStudent().getId().equals(studentId))
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ResponseData<>(StatusApplication.SUCCESS.getCode(), StatusApplication.SUCCESS.getMessage(), dtos));
    }

    /**
     * Thêm bài nộp mới
     */
    @Transactional
    public ResponseEntity<ResponseData<SubmissionDto>> createSubmission(SubmissionCreateRequest request) {
        Optional<Student> studentOpt = studentRepository.findById(request.getStudentId());
        Optional<Exam> examOpt = examRepository.findById(request.getExamId());
        if (studentOpt.isEmpty() || examOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ResponseData<>(400, "Học sinh hoặc bài kiểm tra không tồn tại", null)
            );
        }

        // Kiểm tra xem đã có bài nộp chưa
        Optional<Submission> existingSubmission = submissionRepository.findByExamIdAndStudentId(
                request.getExamId(), request.getStudentId());

        Submission submission;
        if (existingSubmission.isPresent()) {
            submission = existingSubmission.get();
            logger.info("Đã tìm thấy bài nộp có sẵn với id: {}", submission.getId());
        } else {
            submission = new Submission();
            submission.setStudent(studentOpt.get());
            submission.setExam(examOpt.get());
            submission.setStartedAt(LocalDateTime.now());
            submission.setTeacherFeedback(request.getTeacherFeedback());
            logger.info("Tạo bài nộp mới cho học sinh {} và bài kiểm tra {}",
                    request.getStudentId(), request.getExamId());
        }

        Submission saved = submissionRepository.save(submission);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ResponseData<>(StatusApplication.SUCCESS.getCode(), "Bắt đầu làm bài thành công", convertToDto(saved))
        );
    }

    /**
     * Sửa bài nộp
     */
    @Transactional
    public ResponseEntity<ResponseData<SubmissionDto>> updateSubmission(SubmissionUpdateRequest request) {
        Optional<Submission> submissionOpt = submissionRepository.findById(request.getId());
        if (submissionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseData<>(404, "Không tìm thấy bài nộp với id = " + request.getId(), null)
            );
        }
        Submission submission = submissionOpt.get();
        submission.setScore(request.getScore());
        submission.setTeacherFeedback(request.getTeacherFeedback());
        submission.setSubmittedAt(java.time.LocalDateTime.now());
        Submission updated = submissionRepository.save(submission);
        return ResponseEntity.ok(new ResponseData<>(StatusApplication.SUCCESS.getCode(), "Cập nhật bài nộp thành công", convertToDto(updated)));
    }

    /**
     * Xoá bài nộp
     */
    @Transactional
    public ResponseEntity<ResponseData<Void>> deleteSubmission(Long id) {
        Optional<Submission> submissionOpt = submissionRepository.findById(id);
        if (submissionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseData<>(404, "Không tìm thấy bài nộp với id = " + id, null)
            );
        }
        submissionRepository.delete(submissionOpt.get());
        return ResponseEntity.ok(new ResponseData<>(StatusApplication.SUCCESS.getCode(), "Xoá bài nộp thành công", null));
    }

    /**
     * Lưu câu trả lời của học sinh
     */
    @Transactional
    public ResponseEntity<ResponseData<SubmissionAnswer>> saveAnswer(Long submissionId, SubmissionAnswerRequest request) {
        Optional<Submission> submissionOpt = submissionRepository.findById(submissionId);
        if (submissionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseData<>(404, "Không tìm thấy bài nộp với id = " + submissionId, null)
            );
        }

        Submission submission = submissionOpt.get();

        // Kiểm tra xem còn thời gian làm bài không
        if (!isExamActive(submissionId)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ResponseData<>(400, "Đã hết thời gian làm bài", null)
            );
        }

        // Tìm câu hỏi
        Optional<Question> questionOpt = questionRepository.findById(request.getQuestionId());
        if (questionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseData<>(404, "Không tìm thấy câu hỏi với id = " + request.getQuestionId(), null)
            );
        }

        // Tìm xem đã có câu trả lời cho câu hỏi này chưa
        Optional<SubmissionAnswer> existingAnswer = submission.getAnswers().stream()
                .filter(a -> a.getQuestion().getId().equals(request.getQuestionId()))
                .findFirst();

        SubmissionAnswer answer;
        if (existingAnswer.isPresent()) {
            // Nếu có rồi thì cập nhật
            answer = existingAnswer.get();
            answer.setStudentAnswer(request.getStudentAnswer());
            logger.info("Cập nhật câu trả lời cho câu hỏi {}", request.getQuestionId());
        } else {
            // Nếu chưa có thì tạo mới
            answer = new SubmissionAnswer();
            answer.setSubmission(submission);
            answer.setQuestion(questionOpt.get());
            answer.setStudentAnswer(request.getStudentAnswer());
            submission.getAnswers().add(answer);
            logger.info("Thêm câu trả lời mới cho câu hỏi {}", request.getQuestionId());
        }

        // Lưu submission trước để đảm bảo cả submission và answer đều được lưu
        Submission savedSubmission = submissionRepository.save(submission);

        // Tìm lại câu trả lời đã lưu để lấy ID đã được sinh ra
        SubmissionAnswer savedAnswer;
        if (answer.getId() != null) {
            savedAnswer = answer; // Nếu là câu trả lời đã tồn tại
        } else {
            // Nếu là câu trả lời mới, tìm trong danh sách answers đã được lưu
            savedAnswer = savedSubmission.getAnswers().stream()
                    .filter(a -> a.getQuestion().getId().equals(request.getQuestionId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Không thể lưu câu trả lời"));
        }

        logger.info("Đã lưu câu trả lời với ID = {}", savedAnswer.getId());

        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseData<>(StatusApplication.SUCCESS.getCode(), "Lưu câu trả lời thành công", savedAnswer)
        );
    }

    /**
     * Kiểm tra xem bài làm còn trong thời gian làm bài không
     */
    public boolean isExamActive(Long submissionId) {
        Optional<Submission> submissionOpt = submissionRepository.findById(submissionId);
        if (submissionOpt.isEmpty()) {
            return false;
        }

        Submission submission = submissionOpt.get();
        Long examId = submission.getExam().getId();
        Long studentId = submission.getStudent().getId();

        String redisKey = "exam:" + examId + ":student:" + studentId;
        Long ttl = redisTemplate.getExpire(redisKey, TimeUnit.SECONDS);

        return ttl != null && ttl > 0;
    }

    /**
     * Lấy chi tiết bài nộp theo ID
     */
    public SubmissionDto getSubmissionById(Long id) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài nộp với id: " + id));

        return convertToDto(submission);
    }

    /**
     * Lấy chi tiết câu trả lời theo ID
     */
    public SubmissionAnswer getAnswerById(Long id) {
        for (Submission submission : submissionRepository.findAll()) {
            for (SubmissionAnswer answer : submission.getAnswers()) {
                if (answer.getId().equals(id)) {
                    return answer;
                }
            }
        }
        throw new RuntimeException("Không tìm thấy câu trả lời với id: " + id);
    }

    /**
     * Thêm câu trả lời mới cho bài nộp
     */
    @Transactional
    public ResponseEntity<ResponseData<SubmissionAnswer>> addAnswer(Long submissionId, SubmissionAnswer answer) {
        Optional<Submission> submissionOpt = submissionRepository.findById(submissionId);
        if (submissionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseData<>(404, "Không tìm thấy bài nộp với id = " + submissionId, null)
            );
        }

        // Kiểm tra xem còn thời gian làm bài không
        if (!isExamActive(submissionId)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ResponseData<>(400, "Đã hết thời gian làm bài", null)
            );
        }

        answer.setSubmission(submissionOpt.get());
        submissionOpt.get().getAnswers().add(answer);
        submissionRepository.save(submissionOpt.get());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ResponseData<>(StatusApplication.SUCCESS.getCode(), "Thêm câu trả lời thành công", answer)
        );
    }

    /**
     * Sửa câu trả lời
     */
    @Transactional
    public ResponseEntity<ResponseData<SubmissionAnswer>> updateAnswer(Long answerId, SubmissionAnswer newAnswer) {
        // Tìm câu trả lời theo id trong tất cả các bài nộp
        for (Submission submission : submissionRepository.findAll()) {
            for (SubmissionAnswer answer : submission.getAnswers()) {
                if (answer.getId().equals(answerId)) {
                    // Kiểm tra xem còn thời gian làm bài không
                    if (!isExamActive(submission.getId())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                                new ResponseData<>(400, "Đã hết thời gian làm bài", null)
                        );
                    }

                    answer.setStudentAnswer(newAnswer.getStudentAnswer());
                    answer.setIsCorrect(newAnswer.getIsCorrect());
                    answer.setScore(newAnswer.getScore());
                    answer.setTeacherFeedback(newAnswer.getTeacherFeedback());
                    submissionRepository.save(submission);

                    return ResponseEntity.ok(new ResponseData<>(
                            StatusApplication.SUCCESS.getCode(),
                            "Cập nhật câu trả lời thành công",
                            answer)
                    );
                }
            }
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ResponseData<>(404, "Không tìm thấy câu trả lời với id = " + answerId, null)
        );
    }

    /**
     * Xoá câu trả lời
     */
    @Transactional
    public ResponseEntity<ResponseData<Void>> deleteAnswer(Long answerId) {
        for (Submission submission : submissionRepository.findAll()) {
            for (SubmissionAnswer answer : submission.getAnswers()) {
                if (answer.getId().equals(answerId)) {
                    // Kiểm tra xem còn thời gian làm bài không
                    if (!isExamActive(submission.getId())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                                new ResponseData<>(400, "Đã hết thời gian làm bài", null)
                        );
                    }

                    submission.getAnswers().remove(answer);
                    submissionRepository.save(submission);

                    return ResponseEntity.ok(new ResponseData<>(
                            StatusApplication.SUCCESS.getCode(),
                            "Xoá câu trả lời thành công",
                            null)
                    );
                }
            }
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ResponseData<>(404, "Không tìm thấy câu trả lời với id = " + answerId, null)
        );
    }

    /**
     * Tính tổng điểm cho bài nộp
     */
    private void calculateSubmissionScore(Submission submission) {
        if (submission.getSubmittedAt() == null) {
            return;
        }

        double totalScore = 0;
        double maxScore = 0;

        for (SubmissionAnswer answer : submission.getAnswers()) {
            Question question = answer.getQuestion();
            maxScore += question.getMaxScore();
            if (answer.getScore() != null) {
                totalScore += answer.getScore();
            }
        }

        submission.setScore(totalScore);
        submission.setMaxScore(maxScore);
        submissionRepository.save(submission);
    }

    /**
     * Lấy tất cả bài nộp của một bài kiểm tra (chỉ dành cho giáo viên)
     */
    public ResponseEntity<ResponseData<List<SubmissionDto>>> getAllByExamId(Long examId) {
        Optional<Exam> examOpt = examRepository.findById(examId);
        if (examOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseData<>(StatusApplication.NOT_FOUND.getCode(),
                            "Không tìm thấy bài kiểm tra với id = " + examId,
                            null)
            );
        }

        List<Submission> submissions = submissionRepository.findAllByExamId(examId);
        for (Submission submission : submissions) {
            if (submission.getScore() == null && submission.getSubmittedAt() != null) {
                calculateSubmissionScore(submission);
            }
            loadTeacherFeedbackFromComments(submission);
        }
        submissionRepository.saveAll(submissions);

        List<SubmissionDto> dtos = submissions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ResponseData<>(
                StatusApplication.SUCCESS.getCode(),
                "Lấy danh sách " + dtos.size() + " bài nộp của bài kiểm tra thành công",
                dtos)
        );
    }

    /**
     * Tải feedback của giáo viên từ các nhận xét (comments) liên quan đến bài nộp
     */
    private void loadTeacherFeedbackFromComments(Submission submission) {
        try {
            Optional<TeacherComment> latestComment = teacherCommentReposiory
                    .findLatestActiveCommentByExamAndStudent(
                            submission.getExam().getId(),
                            submission.getStudent().getId()
                    );
            if (latestComment.isPresent()) {
                String newFeedback = latestComment.get().getContent();
                if (submission.getTeacherFeedback() == null ||
                        !submission.getTeacherFeedback().equals(newFeedback)) {
                    logger.info("Cập nhật feedback mới cho bài nộp ID={}: {}", submission.getId(), newFeedback);
                    submission.setTeacherFeedback(newFeedback);
                    submissionRepository.updateTeacherFeedback(submission.getId(), newFeedback);
                }
            }
        } catch (Exception e) {
            logger.error("Lỗi khi tải feedback cho bài nộp ID = " + submission.getId(), e);
        }
    }

    /**
     * Lấy danh sách các câu trả lời của một bài nộp (dành cho giáo viên chấm điểm)
     */
    public ResponseEntity<ResponseData<List<SubmissionAnswer>>> getSubmissionAnswers(Long submissionId) {
        Optional<Submission> submissionOpt = submissionRepository.findById(submissionId);
        if (submissionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseData<>(StatusApplication.NOT_FOUND.getCode(),
                            "Không tìm thấy bài nộp với id = " + submissionId,
                            null)
            );
        }

        Submission submission = submissionOpt.get();
        List<SubmissionAnswer> answers = submission.getAnswers();

        return ResponseEntity.ok(new ResponseData<>(
                StatusApplication.SUCCESS.getCode(),
                "Lấy danh sách " + answers.size() + " câu trả lời của bài nộp thành công",
                answers)
        );
    }

    private SubmissionDto convertToDto(Submission submission) {
        return SubmissionDto.builder()
                .id(submission.getId())
                .studentId(submission.getStudent() != null ? submission.getStudent().getId() : null)
                .examId(submission.getExam() != null ? submission.getExam().getId() : null)
                .score(submission.getScore())
                .teacherFeedback(submission.getTeacherFeedback())
                .submittedAt(submission.getSubmittedAt())
                .startedAt(submission.getStartedAt())
                .deadline(submission.getDeadline())
                .maxScore(submission.getMaxScore())
                .build();
    }
}
