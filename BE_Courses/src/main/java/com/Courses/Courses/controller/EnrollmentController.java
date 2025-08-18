package com.Courses.Courses.controller;

import com.Courses.Courses.model.dto.EnrollmentDto;
import com.Courses.Courses.model.dto.StudentCourseDto;
import com.Courses.Courses.model.request.EnrollmentRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    /**
     * Đăng ký học sinh vào khóa học
     */
    @PostMapping("/enroll")
    public ResponseEntity<ResponseData<EnrollmentDto>> enrollStudentToCourse(@Valid @RequestBody EnrollmentRequest request) {
        return enrollmentService.enrollStudentToCourse(request);
    }

    /**
     * Lấy danh sách học sinh trong một khóa học
     */
    @GetMapping("/course/{courseId}/students")
    public ResponseEntity<ResponseData<List<StudentCourseDto>>> getStudentsByCourse(@PathVariable Long courseId) {
        return enrollmentService.getStudentsByCourse(courseId);
    }
}
