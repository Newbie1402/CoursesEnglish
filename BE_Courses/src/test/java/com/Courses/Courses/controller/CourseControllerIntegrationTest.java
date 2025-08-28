package com.Courses.Courses.controller;

import com.Courses.Courses.model.dto.CourseDto;
import com.Courses.Courses.model.dto.CourseScheduleDto;
import com.Courses.Courses.model.entity.Course;
import com.Courses.Courses.model.entity.CourseSchedule;
import com.Courses.Courses.model.entity.Teacher;
import com.Courses.Courses.model.entity.Users;
import com.Courses.Courses.model.request.CourseCreateRequest;
import com.Courses.Courses.model.request.CourseScheduleRequest;
import com.Courses.Courses.model.request.CourseUpdateRequest;
import com.Courses.Courses.repository.CourseRepository;
import com.Courses.Courses.repository.TeacherRepository;
import com.Courses.Courses.repository.UsersRepository;
import com.Courses.Courses.enums.DayOfWeek;
import com.Courses.Courses.enums.Role;
import com.Courses.Courses.enums.Status;
import com.Courses.Courses.enums.TimeSlot;
import com.Courses.Courses.security.jwt.JWTUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class CourseControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private JWTUtil jwtUtil;

    private Teacher testTeacher;
    private String authToken;

    @BeforeEach
    void setUp() {
        // Tạo dữ liệu test
        Users user = new Users();
        user.setEmail("teacher@example.com");
        user.setFullName("Test Teacher");
        user.setPhoneNumber("0987654321");
        // Thay setRole bằng setRoles và sử dụng Set<Role>
        Set<Role> roles = new HashSet<>();
        roles.add(Role.TEACHER);
        user.setRoles(roles);
        // Thay setActive bằng setStatus
        user.setStatus(Status.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        usersRepository.save(user);

        testTeacher = new Teacher();
        testTeacher.setUser(user);
        testTeacher.setBio("Giảng viên có nhiều kinh nghiệm");
        testTeacher.setSpecialization("Giảng dạy tiếng Anh");
        testTeacher.setExperienceYears(5);
        teacherRepository.save(testTeacher);

        // Tạo UserDetails từ Users để tạo JWT token
        UserDetails userDetails = new User(
            user.getEmail(),
            "", // password không cần thiết vì đang test
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_TEACHER"))
        );

        // Tạo JWT token để sử dụng trong các test
        authToken = "Bearer " + jwtUtil.generateToken(userDetails);
    }

    @Test
    @DisplayName("Tạo khóa học mới thành công")
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    public void testCreateCourse_Success() throws Exception {
        // Tạo request để tạo khóa học mới
        CourseCreateRequest request = new CourseCreateRequest();
        request.setTitle("Khóa học tiếng Anh cơ bản");
        request.setDescription("Khóa học dành cho người mới bắt đầu");
        request.setOnline(true);
        request.setStartDate(LocalDate.now().plusDays(7));
        request.setEndDate(LocalDate.now().plusDays(37));
        request.setTeacherId(testTeacher.getId());

        // Tạo lịch học
        List<CourseScheduleRequest> schedules = new ArrayList<>();
        CourseScheduleRequest schedule1 = new CourseScheduleRequest();
        schedule1.setDayOfWeek(DayOfWeek.MONDAY);
        schedule1.setTimeSlot(TimeSlot.SLOT_1);

        CourseScheduleRequest schedule2 = new CourseScheduleRequest();
        schedule2.setDayOfWeek(DayOfWeek.WEDNESDAY);
        schedule2.setTimeSlot(TimeSlot.SLOT_1);

        schedules.add(schedule1);
        schedules.add(schedule2);
        request.setSchedules(schedules);

        // Gọi API tạo khóa học
        ResultActions response = mockMvc.perform(post("/api/courses/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", authToken));

        // Kiểm tra kết quả
        response.andExpect(status().isCreated())
                .andExpect(jsonPath("$.courseId").exists())
                .andExpect(jsonPath("$.title").value("Khóa học tiếng Anh cơ bản"))
                .andExpect(jsonPath("$.description").value("Khóa học dành cho người mới bắt đầu"))
                .andExpect(jsonPath("$.online").value(true))
                .andExpect(jsonPath("$.active").value(true))
                .andExpect(jsonPath("$.teacherId").value(testTeacher.getId()))
                .andExpect(jsonPath("$.schedules", hasSize(2)))
                .andExpect(jsonPath("$.schedules[0].dayOfWeek").value(DayOfWeek.MONDAY.toString()))
                .andExpect(jsonPath("$.schedules[0].timeSlot").value(TimeSlot.SLOT_1.toString()));

        // Kiểm tra xem khóa học đã được lưu trong database chưa
        List<Course> courses = courseRepository.findAll();
        boolean courseExists = courses.stream()
                .anyMatch(c -> "Khóa học tiếng Anh cơ bản".equals(c.getTitle()) &&
                            "Khóa học dành cho người mới bắt đầu".equals(c.getDescription()) &&
                            testTeacher.getId().equals(c.getTeacher().getId()));

        assertTrue(courseExists, "Khóa học phải tồn tại trong database");
    }

    @Test
    @DisplayName("Cập nhật thông tin khóa học thành công")
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    public void testUpdateCourse_Success() throws Exception {
        // Tạo khóa học mẫu để test
        Course course = new Course();
        course.setTitle("Khóa học cũ");
        course.setDescription("Mô tả cũ");
        course.setOnline(true);
        course.setStartDate(LocalDate.now().plusDays(5));
        course.setEndDate(LocalDate.now().plusDays(35));
        course.setTeacher(testTeacher);
        course.setActive(true);
        course.setSchedules(new ArrayList<>());
        courseRepository.save(course);

        // Tạo request để cập nhật khóa học
        CourseUpdateRequest request = new CourseUpdateRequest();
        request.setId(course.getId());
        request.setTitle("Khóa học đã cập nhật");
        request.setDescription("Mô tả mới");
        request.setOnline(false);
        request.setStartDate(LocalDate.now().plusDays(10));
        request.setEndDate(LocalDate.now().plusDays(40));
        request.setTeacherId(testTeacher.getId());

        // Tạo lịch học mới
        List<CourseScheduleRequest> schedules = new ArrayList<>();
        CourseScheduleRequest schedule1 = new CourseScheduleRequest();
        schedule1.setDayOfWeek(DayOfWeek.TUESDAY);
        schedule1.setTimeSlot(TimeSlot.SLOT_2);

        CourseScheduleRequest schedule2 = new CourseScheduleRequest();
        schedule2.setDayOfWeek(DayOfWeek.THURSDAY);
        schedule2.setTimeSlot(TimeSlot.SLOT_2);

        schedules.add(schedule1);
        schedules.add(schedule2);
        request.setSchedules(schedules);

        // Gọi API cập nhật khóa học
        ResultActions response = mockMvc.perform(put("/api/courses/update/" + course.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", authToken));

        // Kiểm tra kết quả
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.courseId").exists())
                .andExpect(jsonPath("$.title").value("Khóa học đã cập nhật"))
                .andExpect(jsonPath("$.description").value("Mô tả mới"))
                .andExpect(jsonPath("$.online").value(false))
                .andExpect(jsonPath("$.schedules", hasSize(2)))
                .andExpect(jsonPath("$.schedules[0].dayOfWeek").value(DayOfWeek.TUESDAY.toString()))
                .andExpect(jsonPath("$.schedules[0].timeSlot").value(TimeSlot.SLOT_2.toString()));

        // Kiểm tra xem khóa học đã được cập nhật trong database chưa
        Course updatedCourse = courseRepository.findById(course.getId()).orElse(null);
        assertNotNull(updatedCourse);
        assertEquals("Khóa học đã cập nhật", updatedCourse.getTitle());
        assertEquals("Mô tả mới", updatedCourse.getDescription());
        assertEquals(false, updatedCourse.isOnline());
        assertEquals(true, updatedCourse.isActive());
        assertEquals(2, updatedCourse.getSchedules().size());
    }

    @Test
    @DisplayName("Vô hiệu hóa khóa học thành công")
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    public void testInactiveCourse_Success() throws Exception {
        // Tạo khóa học mẫu để test
        Course course = new Course();
        course.setTitle("Khóa học để vô hiệu hóa");
        course.setDescription("Mô tả khóa học");
        course.setOnline(true);
        course.setStartDate(LocalDate.now().plusDays(5));
        course.setEndDate(LocalDate.now().plusDays(35));
        course.setTeacher(testTeacher);
        course.setActive(true);
        courseRepository.save(course);

        // Gọi API vô hiệu hóa khóa học
        ResultActions response = mockMvc.perform(delete("/api/courses/inactive/" + course.getId())
                .param("active", "false")
                .header("Authorization", authToken));

        // Kiểm tra kết quả
        response.andExpect(status().isOk())
                .andExpect(content().string("Ẩn khoá học thành công."));

        // Kiểm tra xem khóa học đã được vô hiệu hóa trong database chưa
        Course inactiveCourse = courseRepository.findById(course.getId()).orElse(null);
        assertNotNull(inactiveCourse);
        assertEquals(false, inactiveCourse.isActive());
    }

    @Test
    @DisplayName("Kích hoạt lại khóa học thành công")
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    public void testActivateCourse_Success() throws Exception {
        // Tạo khóa học mẫu đã bị vô hiệu hóa để test
        Course course = new Course();
        course.setTitle("Khóa học để kích hoạt lại");
        course.setDescription("Mô tả khóa học");
        course.setOnline(true);
        course.setStartDate(LocalDate.now().plusDays(5));
        course.setEndDate(LocalDate.now().plusDays(35));
        course.setTeacher(testTeacher);
        course.setActive(false);
        courseRepository.save(course);

        // Gọi API kích hoạt lại khóa học
        ResultActions response = mockMvc.perform(delete("/api/courses/inactive/" + course.getId())
                .param("active", "true")
                .header("Authorization", authToken));

        // Kiểm tra kết quả
        response.andExpect(status().isOk())
                .andExpect(content().string("Hiển thị khoá học thành công."));

        // Kiểm tra xem khóa học đã được kích hoạt lại trong database chưa
        Course activeCourse = courseRepository.findById(course.getId()).orElse(null);
        assertNotNull(activeCourse);
        assertEquals(true, activeCourse.isActive());
    }
}
