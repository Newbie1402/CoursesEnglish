package com.Courses.Courses.service;

import com.Courses.Courses.model.dto.QuestionDto;
import com.Courses.Courses.model.entity.Exam;
import com.Courses.Courses.model.entity.Question;
import com.Courses.Courses.model.request.QuestionCreateRequest;
import com.Courses.Courses.model.request.QuestionUpdateRequest;
import com.Courses.Courses.repository.ExamRepository;
import com.Courses.Courses.repository.QuestionRepository;
import com.Courses.Courses.enums.QuestionType;
import com.Courses.Courses.enums.StatusApplication;
import com.Courses.Courses.model.response.ResponseData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionService {
    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ExamRepository examRepository;

    /**
     * Lấy tất cả câu hỏi
     */
    public ResponseEntity<ResponseData<List<QuestionDto>>> getAllQuestions() {
        List<QuestionDto> questions = questionRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ResponseData<>(
                StatusApplication.SUCCESS.getCode(),
                StatusApplication.SUCCESS.getMessage(),
                questions
        ));
    }

    /**
     * Lấy tất cả câu hỏi của một bài kiểm tra
     */
    public ResponseEntity<ResponseData<List<QuestionDto>>> getAllQuestionsByExamId(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài kiểm tra với id: " + examId));

        List<QuestionDto> questions = questionRepository.findByExam(exam).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ResponseData<>(
                StatusApplication.SUCCESS.getCode(),
                StatusApplication.SUCCESS.getMessage(),
                questions
        ));
    }

    /**
     * Thêm câu hỏi mới
     */
    @Transactional
    public ResponseEntity<ResponseData<QuestionDto>> createQuestion(QuestionCreateRequest request) {
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài kiểm tra với id: " + request.getExamId()));

        Question question = new Question();
        question.setContent(request.getContent());
        question.setType(request.getType());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setOptions(request.getOptions());
        question.setShufflable(request.getIsShufflable());
        question.setMaxScore(request.getMaxScore());
        question.setExam(exam);

        questionRepository.save(question);

        return ResponseEntity.status(HttpStatus.CREATED).body(new ResponseData<>(
                StatusApplication.SUCCESS.getCode(),
                "Thêm câu hỏi thành công",
                convertToDto(question)
        ));
    }

    /**
     * Sửa câu hỏi
     */
    @Transactional
    public ResponseEntity<ResponseData<QuestionDto>> updateQuestion(QuestionUpdateRequest request) {
        Question question = questionRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu hỏi với id: " + request.getId()));

        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài kiểm tra với id: " + request.getExamId()));

        question.setContent(request.getContent());
        question.setType(request.getType());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setOptions(request.getOptions());
        question.setShufflable(request.getIsShufflable());
        question.setMaxScore(request.getMaxScore());
        question.setExam(exam);

        questionRepository.save(question);

        return ResponseEntity.ok(new ResponseData<>(
                StatusApplication.SUCCESS.getCode(),
                "Cập nhật câu hỏi thành công",
                convertToDto(question)
        ));
    }

    /**
     * Xóa câu hỏi
     */
    @Transactional
    public ResponseEntity<ResponseData<Void>> deleteQuestion(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu hỏi với id: " + id));

        questionRepository.delete(question);

        return ResponseEntity.ok(new ResponseData<>(
                StatusApplication.SUCCESS.getCode(),
                "Xóa câu hỏi thành công",
                null
        ));
    }

    /**
     * Lấy chi tiết câu hỏi
     */
    public ResponseEntity<ResponseData<QuestionDto>> getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu hỏi với id: " + id));

        return ResponseEntity.ok(new ResponseData<>(
                StatusApplication.SUCCESS.getCode(),
                StatusApplication.SUCCESS.getMessage(),
                convertToDto(question)
        ));
    }

    private QuestionDto convertToDto(Question question) {
        return QuestionDto.builder()
                .id(question.getId())
                .content(question.getContent())
                .type(question.getType())
                .correctAnswer(question.getCorrectAnswer())
                .options(question.getOptions())
                .isShufflable(question.isShufflable())
                .maxScore(question.getMaxScore())
                .examId(question.getExam() != null ? question.getExam().getId() : null)
                .build();
    }
}
