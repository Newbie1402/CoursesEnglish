package com.Courses.Courses.controller;

import com.Courses.Courses.model.dto.StudentDto;
import com.Courses.Courses.model.request.StudentCreateRequest;
import com.Courses.Courses.model.request.StudentUpdateRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Controller
@RequestMapping("/api/student")
public class StudentController {
    @Autowired
    private StudentService studentService;

    /**
     * API lấy danh sách toàn bộ học sinh
     */
    @GetMapping("/view/all")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ResponseData<List<StudentDto>>> getAllStudents() {
        // Gọi service và trả về response chuẩn hóa
        return studentService.getAllStudents();
    }

    /**
     * API lấy thông tin chi tiết học sinh theo id
     */
    @GetMapping("/view/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN') or @securityUtils.isCurrentUser(#id)")
    public ResponseEntity<ResponseData<StudentDto>> getStudentById(@PathVariable Long id) {
        return studentService.getStudentById(id);
    }

    /**
     * API thêm mới học sinh
     */
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseData<StudentDto>> createStudent(@Validated @RequestBody StudentCreateRequest request) {
        return studentService.createStudent(request);
    }

    /**
     * API cập nhật thông tin học sinh theo id
     */
    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isCurrentUser(#id)")
    public ResponseEntity<ResponseData<StudentDto>> updateStudent(@PathVariable Long id, @Validated @RequestBody StudentUpdateRequest request) {
        return studentService.updateStudent(id, request);
    }
}
