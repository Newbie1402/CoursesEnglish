package com.Courses.Courses.service;

import com.Courses.Courses.model.dto.ExamDto;
import com.Courses.Courses.model.dto.QuestionDto;
import com.Courses.Courses.model.dto.StudentDto;
import com.Courses.Courses.model.dto.TeacherDto;
import com.Courses.Courses.model.dto.TeacherCommentDto;
import com.Courses.Courses.model.entity.Exam;
import com.Courses.Courses.model.entity.Question;
import com.Courses.Courses.model.entity.Student;
import com.Courses.Courses.model.entity.Teacher;
import com.Courses.Courses.model.entity.TeacherComment;
import com.Courses.Courses.model.request.TeacherCommentCreateRequest;
import com.Courses.Courses.model.request.TeacherCommentUpdateRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.repository.TeacherCommentReposiory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TeacherCommentService {
    @Autowired
    private TeacherCommentReposiory teacherCommentReposiory;

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private ExamService examService;

    @Autowired
    private QuestionService questionService;

    /**
     * Thêm một nhận xét mới
     */
    @Transactional
    public ResponseEntity<ResponseData<TeacherCommentDto>> createComment(TeacherCommentCreateRequest request) {
        // Kiểm tra người dùng có role TEACHER không
        ResponseEntity<ResponseData<TeacherDto>> teacherResponse = teacherService.getTeacherById(request.getTeacherId());
        if (teacherResponse.getStatusCode() != HttpStatus.OK || teacherResponse.getBody() == null || teacherResponse.getBody().getData() == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(404, "Không tìm thấy giáo viên", null));
        }
        Teacher teacher = convertTeacherDtoToEntity(teacherResponse.getBody().getData());

        // Kiểm tra học viên tồn tại
        ResponseEntity<ResponseData<StudentDto>> studentResponse = studentService.getStudentById(request.getStudentId());
        if (studentResponse.getStatusCode() != HttpStatus.OK || studentResponse.getBody() == null || studentResponse.getBody().getData() == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(404, "Không tìm thấy học viên", null));
        }
        Student student = convertStudentDtoToEntity(studentResponse.getBody().getData());

        TeacherComment comment = new TeacherComment();
        comment.setTeacher(teacher);
        comment.setStudent(student);
        comment.setContent(request.getContent());

        comment.setCommentedAt(LocalDateTime.now());

        // Nếu có examId, liên kết với bài kiểm tra
        if (request.getExamId() != null) {
            ResponseEntity<ResponseData<ExamDto>> examResponse = examService.getExamById(request.getExamId());
            if (examResponse.getStatusCode() != HttpStatus.OK || examResponse.getBody() == null || examResponse.getBody().getData() == null) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ResponseData<>(404, "Không tìm thấy bài kiểm tra", null));
            }
            Exam exam = convertExamDtoToEntity(examResponse.getBody().getData());
            comment.setExam(exam);
        }

        // Nếu có questionId, liên kết với câu hỏi
        if (request.getQuestionId() != null) {
            ResponseEntity<ResponseData<QuestionDto>> questionResponse = questionService.getQuestionById(request.getQuestionId());
            if (questionResponse.getStatusCode() != HttpStatus.OK || questionResponse.getBody() == null || questionResponse.getBody().getData() == null) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ResponseData<>(404, "Không tìm thấy câu hỏi", null));
            }
            Question question = convertQuestionDtoToEntity(questionResponse.getBody().getData());
            comment.setQuestion(question);
        }

        TeacherComment savedComment = teacherCommentReposiory.save(comment);
        TeacherCommentDto dto = convertToDto(savedComment);

        // Gửi thông báo cho học viên về nhận xét mới
        notifyNewComment(savedComment);

        return ResponseEntity.ok(new ResponseData<>(200, "Thêm nhận xét thành công", dto));
    }

    /**
     * Cập nhật nhận xét
     */
    @Transactional
    public ResponseEntity<ResponseData<TeacherCommentDto>> updateComment(Long id, TeacherCommentUpdateRequest request) {
        Optional<TeacherComment> optionalComment = teacherCommentReposiory.findById(id);
        if (optionalComment.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(404, "Không tìm thấy nhận xét", null));
        }

        TeacherComment comment = optionalComment.get();

        // Chỉ cho phép cập nhật nội dung nhận xét, không cho phép thay đổi mối quan hệ
        comment.setContent(request.getContent());

        // Luôn cập nhật thời gian khi sửa nhận xét, sử dụng thời gian hiện tại của hệ thống
        comment.setCommentedAt(LocalDateTime.now());

        TeacherComment updatedComment = teacherCommentReposiory.save(comment);
        TeacherCommentDto dto = convertToDto(updatedComment);

        // Gửi thông báo cho học viên về cập nhật nhận xét
        notifyCommentUpdated(updatedComment);

        return ResponseEntity.ok(new ResponseData<>(200, "Cập nhật nhận xét thành công", dto));
    }

    /**
     * Xóa nhận xét (soft delete - chỉ đánh dấu inactive)
     */
    @Transactional
    public ResponseEntity<ResponseData<String>> deleteComment(Long id) {
        Optional<TeacherComment> optionalComment = teacherCommentReposiory.findById(id);
        if (optionalComment.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(404, "Không tìm thấy nhận xét", null));
        }

        TeacherComment comment = optionalComment.get();
        comment.setActive(false);
        teacherCommentReposiory.save(comment);

        // Gửi thông báo về việc xóa nhận xét
        notifyCommentDeleted(comment);

        return ResponseEntity.ok(new ResponseData<>(200, "Xóa nhận xét thành công", "Đã xóa nhận xét ID: " + id));
    }

    /**
     * Lấy tất cả nhận xét đang active
     */
    public ResponseEntity<ResponseData<List<TeacherCommentDto>>> getAllActiveComments() {
        List<TeacherComment> comments = teacherCommentReposiory.findByActiveTrue();
        List<TeacherCommentDto> dtoList = comments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ResponseData<>(200, "Lấy danh sách nhận xét thành công", dtoList));
    }

    /**
     * Lấy tất cả nhận xét đã inactive
     */
    public ResponseEntity<ResponseData<List<TeacherCommentDto>>> getAllInactiveComments() {
        List<TeacherComment> comments = teacherCommentReposiory.findByActiveFalse();
        List<TeacherCommentDto> dtoList = comments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ResponseData<>(200, "Lấy danh sách nhận xét đã xóa thành công", dtoList));
    }

    /**
     * Lấy nhận xét theo ID học viên
     */
    public ResponseEntity<ResponseData<List<TeacherCommentDto>>> getCommentsByStudentId(Long studentId) {
        List<TeacherComment> comments = teacherCommentReposiory.findByStudentIdAndActiveTrue(studentId);
        List<TeacherCommentDto> dtoList = comments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(
                new ResponseData<>(200, "Lấy danh sách nhận xét của học viên thành công", dtoList)
        );
    }

    /**
     * Lấy nhận xét theo ID giáo viên
     */
    public ResponseEntity<ResponseData<List<TeacherCommentDto>>> getCommentsByTeacherId(Long teacherId) {
        List<TeacherComment> comments = teacherCommentReposiory.findByTeacherIdAndActiveTrue(teacherId);
        List<TeacherCommentDto> dtoList = comments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(
                new ResponseData<>(200, "Lấy danh sách nhận xét của giáo viên thành công", dtoList)
        );
    }

    /**
     * Lấy nhận xét theo ID bài kiểm tra
     */
    public ResponseEntity<ResponseData<List<TeacherCommentDto>>> getCommentsByExamId(Long examId) {
        List<TeacherComment> comments = teacherCommentReposiory.findByExamIdAndActiveTrue(examId);
        List<TeacherCommentDto> dtoList = comments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(
                new ResponseData<>(200, "Lấy danh sách nhận xét của bài kiểm tra thành công", dtoList)
        );
    }

    /**
     * Lấy nhận xét theo ID câu hỏi
     */
    public ResponseEntity<ResponseData<List<TeacherCommentDto>>> getCommentsByQuestionId(Long questionId) {
        List<TeacherComment> comments = teacherCommentReposiory.findByQuestionIdAndActiveTrue(questionId);
        List<TeacherCommentDto> dtoList = comments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(
                new ResponseData<>(200, "Lấy danh sách nhận xét của câu hỏi thành công", dtoList)
        );
    }

    private TeacherCommentDto convertToDto(TeacherComment comment) {
        return TeacherCommentDto.builder()
                .id(comment.getId())
                .teacherId(comment.getTeacher().getId())
                .studentId(comment.getStudent().getId())
                .examId(comment.getExam() != null ? comment.getExam().getId() : null)
                .questionId(comment.getQuestion() != null ? comment.getQuestion().getId() : null)
                .content(comment.getContent())
                .commentedAt(comment.getCommentedAt())
                .build();
    }

    // Các phương thức thông báo
    private void notifyNewComment(TeacherComment comment) {
        // Triển khai logic gửi thông báo khi có nhận xét mới
    }

    private void notifyCommentUpdated(TeacherComment comment) {
        // Triển khai logic gửi thông báo khi có cập nhật nhận xét
    }

    private void notifyCommentDeleted(TeacherComment comment) {
        // Triển khai logic gửi thông báo khi xóa nhận xét
    }

    // Các phương thức chuyển đổi từ DTO sang entity
    private Teacher convertTeacherDtoToEntity(TeacherDto dto) {
        Teacher teacher = new Teacher();
        teacher.setId(dto.getTeacherId());
         
        return teacher;
    }

    private Student convertStudentDtoToEntity(StudentDto dto) {
        Student student = new Student();
        student.setId(dto.getStudentId());
         
        return student;
    }

    private Exam convertExamDtoToEntity(ExamDto dto) {
        Exam exam = new Exam();
        exam.setId(dto.getExamId());
         
        return exam;
    }

    private Question convertQuestionDtoToEntity(QuestionDto dto) {
        Question question = new Question();
        question.setId(dto.getId()); 
         
        return question;
    }
}
