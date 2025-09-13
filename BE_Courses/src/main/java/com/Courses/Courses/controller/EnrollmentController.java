package com.Courses.Courses.controller;

import com.Courses.Courses.enums.StatusApplication;
import com.Courses.Courses.model.dto.EnrollmentDto;
import com.Courses.Courses.model.dto.StudentCourseDto;
import com.Courses.Courses.model.request.EnrollmentRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    /**
     * Đăng ký học sinh vào khóa học
     */
    @PostMapping("/enroll")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER') or (hasRole('STUDENT') and @securityUtils.isCurrentUser(#request.studentId))")
    public ResponseEntity<ResponseData<EnrollmentDto>> enrollStudentToCourse(@Valid @RequestBody EnrollmentRequest request) {
        return enrollmentService.enrollStudentToCourse(request);
    }

    /**
     * Lấy danh sách học sinh trong một khóa học
     */
    @GetMapping("/course/{courseId}/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ResponseData<List<StudentCourseDto>>> getStudentsByCourse(@PathVariable Long courseId) {
        return enrollmentService.getStudentsByCourse(courseId);
    }
}
