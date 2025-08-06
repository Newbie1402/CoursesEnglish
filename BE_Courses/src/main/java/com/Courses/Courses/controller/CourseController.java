package com.Courses.Courses.controller;

import com.Courses.Courses.model.dto.CourseDto;
import com.Courses.Courses.model.request.CourseCreateRequest;
import com.Courses.Courses.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RestController
@RequestMapping("/api/courses")
public class CourseController {
    @Autowired
    private CourseService courseService;

    /**
     * Lấy danh sách tất cả khoá học đang hoạt động
     */
    @GetMapping("/view/all")
    public ResponseEntity<List<CourseDto>> getAllCourses() {
        List<CourseDto> courses = courseService.getAllCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/view/full")
    public ResponseEntity<List<CourseDto>> getFULLCourses() {
        List<CourseDto> courses = courseService.getFULLCourses();
        return ResponseEntity.ok(courses);
    }

    /**
     * Lấy thông tin khoá học theo id
     */
    @GetMapping("/view/{id}")
    public ResponseEntity<CourseDto> getCourseById(@PathVariable Long id) {
        CourseDto course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    /**
     * Sửa thông tin khoá học
     */
    @PutMapping("/update/{id}")
    public ResponseEntity<CourseDto> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseCreateRequest request) {
        CourseDto updated = courseService.updateCourse(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Inactive (xoá mềm) khoá học
     */
    @DeleteMapping("/inactive/{id}")
    public ResponseEntity<String> inactiveCourse(@PathVariable Long id, @RequestParam boolean active) {
        courseService.setActiveStatus(id, active);
        String message = active ? "Hiển thị khoá học thành công." : "Ẩn khoá học thành công.";
        return ResponseEntity.ok(message);
    }

    /**
     * Thêm mới khoá học
     */
    @PostMapping("/create")
    public ResponseEntity<CourseDto> createCourse(@Valid @RequestBody CourseCreateRequest request) {
        CourseDto created = courseService.createCourse(request);
        return ResponseEntity.status(201).body(created);
    }
}
