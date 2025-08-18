package com.Courses.Courses.service;

import com.Courses.Courses.enums.StatusApplication;
import com.Courses.Courses.model.dto.EnrollmentDto;
import com.Courses.Courses.model.dto.StudentCourseDto;
import com.Courses.Courses.model.entity.Course;
import com.Courses.Courses.model.entity.Enrollment;
import com.Courses.Courses.model.entity.Student;
import com.Courses.Courses.model.entity.Users;
import com.Courses.Courses.model.request.EnrollmentRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.repository.CourseRepository;
import com.Courses.Courses.repository.EnrollmentRepository;
import com.Courses.Courses.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {
    private static final Logger log = LoggerFactory.getLogger(EnrollmentService.class);

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    /**
     * Đăng ký học sinh vào khóa học
     * @param request Thông tin đăng ký
     * @return ResponseEntity chứa thông tin đăng ký
     */
    @Transactional
    public ResponseEntity<ResponseData<EnrollmentDto>> enrollStudentToCourse(EnrollmentRequest request) {
        try {
            if (enrollmentRepository.existsByStudentIdAndCourseId(request.getStudentId(), request.getCourseId())) {
                log.warn("Học sinh (ID: {}) đã đăng ký khóa học (ID: {})", request.getStudentId(), request.getCourseId());
                return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    new ResponseData<>(
                        StatusApplication.BAD_REQUEST.getCode(),
                        "Học sinh này đã được đăng ký vào khóa học",
                        null
                    )
                );
            }

            // Tìm học sinh
            Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> {
                    log.error("Không tìm thấy học sinh với ID: {}", request.getStudentId());
                    return new RuntimeException("Không tìm thấy học sinh với ID: " + request.getStudentId());
                });

            Course course = courseRepository.findById(request.getCourseId())
                .filter(Course::isActive)
                .orElseThrow(() -> {
                    log.error("Không tìm thấy khóa học active với ID: {}", request.getCourseId());
                    return new RuntimeException("Không tìm thấy khóa học đang hoạt động với ID: " + request.getCourseId());
                });

            Enrollment enrollment = new Enrollment();
            enrollment.setStudent(student);
            enrollment.setCourse(course);
            enrollment.setEnrolledAt(LocalDateTime.now());

            Enrollment saved = enrollmentRepository.save(enrollment);
            log.info("Đăng ký thành công học sinh (ID: {}) vào khóa học (ID: {})", request.getStudentId(), request.getCourseId());

            return ResponseEntity.status(HttpStatus.CREATED).body(
                new ResponseData<>(
                    StatusApplication.SUCCESS.getCode(),
                    "Đăng ký học sinh vào khóa học thành công",
                    toDto(saved)
                )
            );
        } catch (Exception e) {
            log.error("Lỗi khi đăng ký học sinh vào khóa học: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ResponseData<>(
                    StatusApplication.INTERNAL_SERVER_ERROR.getCode(),
                    "Lỗi khi đăng ký học sinh: " + e.getMessage(),
                    null
                )
            );
        }
    }

    /**
     * Lấy danh sách học sinh trong một khóa học
     * @param courseId ID khóa học
     * @return ResponseEntity chứa danh sách học sinh
     */
    @Transactional(readOnly = true)
    public ResponseEntity<ResponseData<List<StudentCourseDto>>> getStudentsByCourse(Long courseId) {
        try {
            Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> {
                    log.error("Không tìm thấy khóa học với ID: {}", courseId);
                    return new RuntimeException("Không tìm thấy khóa học với ID: " + courseId);
                });

            List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
            List<StudentCourseDto> studentDtos = enrollments.stream()
                .map(enrollment -> {
                    Student student = enrollment.getStudent();
                    Users user = student.getUser();

                    return StudentCourseDto.builder()
                        .id(student.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .phone(user.getPhoneNumber())
                        .enrolledAt(enrollment.getEnrolledAt())
                        .build();
                })
                .collect(Collectors.toList());

            log.info("Lấy thành công danh sách {} học sinh trong khóa học ID: {}", studentDtos.size(), courseId);

            return ResponseEntity.ok(
                new ResponseData<>(
                    StatusApplication.SUCCESS.getCode(),
                    String.format("Tìm thấy %d học sinh trong khóa học '%s'", studentDtos.size(), course.getTitle()),
                    studentDtos
                )
            );
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách học sinh trong khóa học: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ResponseData<>(
                    StatusApplication.INTERNAL_SERVER_ERROR.getCode(),
                    "Lỗi khi lấy danh sách học sinh: " + e.getMessage(),
                    null
                )
            );
        }
    }

    private EnrollmentDto toDto(Enrollment enrollment) {
        return EnrollmentDto.builder()
            .id(enrollment.getId())
            .studentId(enrollment.getStudent().getId())
            .studentName(enrollment.getStudent().getUser().getFullName())
            .courseId(enrollment.getCourse().getId())
            .courseName(enrollment.getCourse().getTitle())
            .enrolledAt(enrollment.getEnrolledAt())
            .build();
    }
}
