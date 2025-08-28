package com.Courses.Courses.controller;

import com.Courses.Courses.enums.ExamType;
import com.Courses.Courses.model.dto.ExamDto;
import com.Courses.Courses.model.entity.Course;
import com.Courses.Courses.model.entity.Exam;
import com.Courses.Courses.model.request.ExamCreateRequest;
import com.Courses.Courses.model.request.ExamUpdateRequest;
import com.Courses.Courses.repository.CourseRepository;
import com.Courses.Courses.repository.ExamRepository;
import com.Courses.Courses.service.ExamService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ExamControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private CourseRepository courseRepository;

    private Course testCourse;
    private Exam testExam;

    @BeforeEach
    void setUp() {
        // Tạo một khóa học test
        testCourse = new Course();
        testCourse.setTitle("Khóa học test cho Exam");
        testCourse.setDescription("Mô tả khóa học test");
        testCourse.setActive(true);
        testCourse = courseRepository.save(testCourse);

        // Tạo một bài kiểm tra test
        testExam = new Exam();
        testExam.setTitle("Bài kiểm tra test");
        testExam.setType(ExamType.MULTIPLE_CHOICE);
        testExam.setCourse(testCourse);
        testExam.setStartTime(LocalDateTime.now().plusDays(1));
        testExam.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));
        testExam.setDurationMinutes(120);
        testExam.setDescription("Mô tả bài kiểm tra test");
        testExam.setPassword("password123");
        testExam.setActive(true);
        testExam = examRepository.save(testExam);
    }

    @AfterEach
    void tearDown() {
        examRepository.deleteAll();
        courseRepository.deleteAll();
    }

    @Test
    @WithMockUser(roles = {"TEACHER"})
    void testGetAllExams() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/exams")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode", is(200)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].id", notNullValue()))
                .andExpect(jsonPath("$.data[0].title", is("Bài kiểm tra test")));
    }

    @Test
    @WithMockUser(roles = {"STUDENT"})
    void testGetAllActiveExams() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/exams/active")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode", is(200)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].title", is("Bài kiểm tra test")));
    }

    @Test
    @WithMockUser(roles = {"TEACHER"})
    void testGetExamsByCourseId() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/exams/course/" + testCourse.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode", is(200)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].title", is("Bài kiểm tra test")));
    }

    @Test
    @WithMockUser(roles = {"STUDENT"})
    void testGetActiveExamsByCourseId() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/exams/course/" + testCourse.getId() + "/active")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode", is(200)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].title", is("Bài kiểm tra test")));
    }

    @Test
    @WithMockUser(roles = {"STUDENT", "TEACHER"})
    void testGetExamById() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/exams/" + testExam.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode", is(200)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data.id", is(testExam.getId().intValue())))
                .andExpect(jsonPath("$.data.title", is("Bài kiểm tra test")))
                .andExpect(jsonPath("$.data.type", is("MULTIPLE_CHOICE")));
    }

    @Test
    @WithMockUser(roles = {"TEACHER"})
    void testCreateExam() throws Exception {
        ExamCreateRequest request = new ExamCreateRequest();
        request.setTitle("Bài kiểm tra mới");
        request.setType(ExamType.WRITING);
        request.setCourseId(testCourse.getId());
        request.setStartTime(LocalDateTime.now().plusDays(2));
        request.setEndTime(LocalDateTime.now().plusDays(2).plusHours(2));
        request.setDurationMinutes(60);
        request.setDescription("Mô tả bài kiểm tra mới");
        request.setPassword("pass123");

        String requestJson = objectMapper.writeValueAsString(request);

        mockMvc.perform(MockMvcRequestBuilders.post("/api/exams/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.statusCode", is(200)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data.title", is("Bài kiểm tra mới")))
                .andExpect(jsonPath("$.data.type", is("WRITING")))
                .andExpect(jsonPath("$.data.durationMinutes", is(60)));

        // Kiểm tra xem bài kiểm tra đã được lưu vào database chưa
        List<Exam> exams = examRepository.findAll().stream()
                .filter(exam -> "Bài kiểm tra mới".equals(exam.getTitle()))
                .toList();
        assertEquals(1, exams.size());
        assertEquals(ExamType.WRITING, exams.get(0).getType());
    }

    @Test
    @WithMockUser(roles = {"TEACHER"})
    void testUpdateExam() throws Exception {
        ExamUpdateRequest request = new ExamUpdateRequest();
        request.setId(testExam.getId());
        request.setTitle("Bài kiểm tra đã cập nhật");
        request.setType(ExamType.WRITING);
        request.setCourseId(testCourse.getId());
        request.setStartTime(LocalDateTime.now().plusDays(3));
        request.setEndTime(LocalDateTime.now().plusDays(3).plusHours(3));
        request.setDurationMinutes(180);
        request.setDescription("Mô tả bài kiểm tra đã cập nhật");
        request.setPassword("newpassword");

        String requestJson = objectMapper.writeValueAsString(request);

        mockMvc.perform(MockMvcRequestBuilders.put("/api/exams/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode", is(200)))
                .andExpect(jsonPath("$.message", is("Success")))
                .andExpect(jsonPath("$.data.title", is("Bài kiểm tra đã cập nhật")))
                .andExpect(jsonPath("$.data.type", is("WRITING")))
                .andExpect(jsonPath("$.data.durationMinutes", is(180)));

        // Kiểm tra xem bài kiểm tra đã được cập nhật trong database chưa
        Exam updatedExam = examRepository.findById(testExam.getId()).orElse(null);
        assertNotNull(updatedExam);
        assertEquals("Bài kiểm tra đã cập nhật", updatedExam.getTitle());
        assertEquals(ExamType.WRITING, updatedExam.getType());
    }


    @Test
    @WithMockUser(roles = {"STUDENT"})
    void testAccessDeniedForTeacherEndpoints() throws Exception {
        // Sinh viên không được phép truy cập endpoint chỉ dành cho giáo viên
        mockMvc.perform(MockMvcRequestBuilders.get("/api/exams")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        ExamCreateRequest request = new ExamCreateRequest();
        request.setTitle("Bài kiểm tra mới");
        request.setType(ExamType.WRITING);
        request.setCourseId(testCourse.getId());

        String requestJson = objectMapper.writeValueAsString(request);

        mockMvc.perform(MockMvcRequestBuilders.post("/api/exams/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isForbidden());
    }
}
