package com.Courses.Courses.controller;

import com.Courses.Courses.model.dto.TeacherDto;
import com.Courses.Courses.model.request.TeacherCreateRequest;
import com.Courses.Courses.model.request.TeacherUpdateRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RestController
@RequestMapping("/api/teacher")
public class TeacherController {
    @Autowired
    private TeacherService teacherService;

    /**
     * API lấy danh sách toàn bộ giáo viên
     */
    @GetMapping("/view/all")
    public ResponseEntity<ResponseData<List<TeacherDto>>> getAllTeachers() {
        return teacherService.getAllTeachers();
    }

    /**
     * API lấy thông tin chi tiết giáo viên theo id
     */
    @GetMapping("/view/{id}")
    public ResponseEntity<ResponseData<TeacherDto>> getTeacherById(@PathVariable Long id) {
        return teacherService.getTeacherById(id);
    }

    /**
     * API thêm mới giáo viên
     */
    @PostMapping("/create")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ResponseData<TeacherDto>> createTeacher(@Validated @RequestBody TeacherCreateRequest request) {
        return teacherService.createTeacher(request);
    }

    /**
     * API cập nhật thông tin giáo viên theo id
     */
    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('TEACHER') or @securityUtils.isCurrentUser(#id)")
    public ResponseEntity<ResponseData<TeacherDto>> updateTeacher(@PathVariable Long id, @Validated @RequestBody TeacherUpdateRequest request) {
        return teacherService.updateTeacher(id, request);
    }
}
