package com.Courses.Courses.service;

import com.Courses.Courses.enums.DayOfWeek;
import com.Courses.Courses.enums.StatusApplication;
import com.Courses.Courses.model.dto.CourseScheduleDto;
import com.Courses.Courses.model.dto.EnrollmentDto;
import com.Courses.Courses.model.dto.StudentCourseDto;
import com.Courses.Courses.model.entity.Course;
import com.Courses.Courses.model.entity.CourseSchedule;
import com.Courses.Courses.model.entity.Enrollment;
import com.Courses.Courses.model.entity.Student;
import com.Courses.Courses.model.entity.Teacher;
import com.Courses.Courses.model.entity.Users;
import com.Courses.Courses.model.request.EnrollmentRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.model.response.ScheduleConflictResponse;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    @Autowired
    private NotificationService notificationService;

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

            // Kiểm tra xung đột lịch học
            List<ScheduleConflictResponse> conflictSchedules = checkScheduleConflict(student.getId(), course);
            if (!conflictSchedules.isEmpty()) {
                log.warn("Phát hiện lịch học trùng cho học sinh (ID: {}) khi đăng ký khóa học (ID: {})",
                    request.getStudentId(), request.getCourseId());

                return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    new ResponseData<EnrollmentDto>(
                        StatusApplication.SCHEDULE_CONFLICT.getCode(),
                        "Phát hiện lịch học bị trùng. Vui lòng kiểm tra lịch học!",
                        null
                    )
                );
            }

            Enrollment enrollment = new Enrollment();
            enrollment.setStudent(student);
            enrollment.setCourse(course);
            enrollment.setEnrolledAt(LocalDateTime.now());

            Enrollment saved = enrollmentRepository.save(enrollment);
            EnrollmentDto enrollmentDto = toDto(saved);
            log.info("Đăng ký thành công học sinh (ID: {}) vào khóa học (ID: {})",
                    request.getStudentId(), request.getCourseId());

            // Gửi thông báo cho học sinh về việc đăng ký thành công
            Long userId = student.getUser().getId();
            String title = "Đăng ký khóa học thành công";
            String message = String.format("Bạn đã được đăng ký vào khóa học \"%s\" thành công. "
                    + "Khóa học bắt đầu từ %s đến %s.",
                    course.getTitle(),
                    course.getStartDate().toString(),
                    course.getEndDate().toString());

            notificationService.createAndSendNotification(
                userId,
                title,
                message,
                "ENROLLMENT",
                course.getId()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(
                new ResponseData<>(
                    StatusApplication.SUCCESS.getCode(),
                    "Đăng ký học sinh vào khóa học thành công",
                    enrollmentDto
                )
            );
        } catch (Exception e) {
            log.error("Lỗi khi đăng ký học sinh vào khóa học: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ResponseData<EnrollmentDto>(
                    StatusApplication.INTERNAL_SERVER_ERROR.getCode(),
                    "Lỗi khi đăng ký học sinh: " + e.getMessage(),
                    null
                )
            );
        }
    }

    /**
     * Kiểm tra xung đột lịch học cho học sinh
     * @param studentId ID của học sinh
     * @param newCourse Khóa học mới muốn đăng ký
     * @return Danh sách các xung đột lịch học (nếu có)
     */
    private List<ScheduleConflictResponse> checkScheduleConflict(Long studentId, Course newCourse) {
        List<Enrollment> existingEnrollments = enrollmentRepository.findByStudentId(studentId);

        if (existingEnrollments.isEmpty() || newCourse.getSchedules() == null || newCourse.getSchedules().isEmpty()) {
            return new ArrayList<>();
        }

        List<ScheduleConflictResponse> conflicts = new ArrayList<>();

        // Lưu trữ lịch học của khóa học mới theo cặp [dayOfWeek, timeSlot]
        Map<String, CourseSchedule> newSchedules = new HashMap<>();
        for (CourseSchedule schedule : newCourse.getSchedules()) {
            String key = schedule.getDayOfWeek() + "_" + schedule.getTimeSlot();
            newSchedules.put(key, schedule);
        }

        // Kiểm tra với mỗi khóa học đã đăng ký
        for (Enrollment enrollment : existingEnrollments) {
            Course existingCourse = enrollment.getCourse();

            // Bỏ qua các khóa học không còn active
            if (!existingCourse.isActive()) {
                continue;
            }

            // Kiểm tra từng lịch học của khóa học hiện có
            if (existingCourse.getSchedules() != null) {
                for (CourseSchedule existingSchedule : existingCourse.getSchedules()) {
                    String key = existingSchedule.getDayOfWeek() + "_" + existingSchedule.getTimeSlot();

                    // Nếu có trùng lịch
                    if (newSchedules.containsKey(key)) {
                        CourseSchedule conflictSchedule = newSchedules.get(key);

                        ScheduleConflictResponse conflict = new ScheduleConflictResponse();
                        conflict.setDayOfWeek(existingSchedule.getDayOfWeek());
                        conflict.setTimeSlot(existingSchedule.getTimeSlot());
                        conflict.setTimeRange(existingSchedule.getTimeSlot().getTimeRange());
                        conflict.setExistingCourseId(existingCourse.getId());
                        conflict.setExistingCourseTitle(existingCourse.getTitle());
                        conflict.setNewCourseId(newCourse.getId());
                        conflict.setNewCourseTitle(newCourse.getTitle());

                        conflicts.add(conflict);
                    }
                }
            }
        }

        return conflicts;
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
        Course course = enrollment.getCourse();
        Teacher teacher = course.getTeacher();

        EnrollmentDto dto = EnrollmentDto.builder()
            .id(enrollment.getId())
            .studentId(enrollment.getStudent().getId())
            .studentName(enrollment.getStudent().getUser().getFullName())
            .courseId(course.getId())
            .courseName(course.getTitle())
            .courseDescription(course.getDescription())
            .courseOnline(course.isOnline())
            .courseStartDate(course.getStartDate())
            .courseEndDate(course.getEndDate())
            .teacherId(teacher != null ? teacher.getId() : null)
            .teacherName(teacher != null && teacher.getUser() != null ?
                        teacher.getUser().getFullName() : null)
            .enrolledAt(enrollment.getEnrolledAt())
            .build();
        if (course.getSchedules() != null && !course.getSchedules().isEmpty()) {
            List<CourseScheduleDto> scheduleDtos = course.getSchedules().stream()
                .map(schedule -> CourseScheduleDto.builder()
                    .id(schedule.getId())
                    .dayOfWeek(schedule.getDayOfWeek())
                    .timeSlot(schedule.getTimeSlot())
                    .timeRange(schedule.getTimeSlot() != null ?
                               schedule.getTimeSlot().getTimeRange() : null)
                    .build())
                .collect(Collectors.toList());
            dto.setSchedules(scheduleDtos);
        }

        return dto;
    }
}
