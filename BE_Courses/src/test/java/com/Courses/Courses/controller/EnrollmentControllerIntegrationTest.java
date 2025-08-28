package com.Courses.Courses.controller;

import com.Courses.Courses.enums.DayOfWeek;
import com.Courses.Courses.enums.Role;
import com.Courses.Courses.enums.Status;
import com.Courses.Courses.enums.StatusApplication;
import com.Courses.Courses.enums.TimeSlot;
import com.Courses.Courses.model.entity.*;
import com.Courses.Courses.model.request.EnrollmentRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.repository.*;
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
public class EnrollmentControllerIntegrationTest {

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
    private StudentRepository studentRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private JWTUtil jwtUtil;

    private Teacher testTeacher;
    private Student testStudent;
    private Course testCourse;
    private String authToken;

    @BeforeEach
    void setUp() {
        // Tạo dữ liệu giáo viên test
        Users teacherUser = new Users();
        teacherUser.setEmail("teacher@example.com");
        teacherUser.setFullName("Test Teacher");
        teacherUser.setPhoneNumber("0987654321");
        // Thay setRole bằng setRoles với Set<Role>
        Set<Role> teacherRoles = new HashSet<>();
        teacherRoles.add(Role.TEACHER);
        teacherUser.setRoles(teacherRoles);
        // Thay setActive bằng setStatus
        teacherUser.setStatus(Status.ACTIVE);
        teacherUser.setCreatedAt(LocalDateTime.now());
        usersRepository.save(teacherUser);

        testTeacher = new Teacher();
        testTeacher.setUser(teacherUser);
        testTeacher.setBio("Giảng viên có nhiều kinh nghiệm");
        testTeacher.setSpecialization("Thạc sĩ Giảng dạy tiếng Anh");
        testTeacher.setExperienceYears(5);
        teacherRepository.save(testTeacher);

        // Tạo dữ liệu học sinh test
        Users studentUser = new Users();
        studentUser.setEmail("student@example.com");
        studentUser.setFullName("Test Student");
        studentUser.setPhoneNumber("0123456789");
        // Thay setRole bằng setRoles với Set<Role>
        Set<Role> studentRoles = new HashSet<>();
        studentRoles.add(Role.STUDENT);
        studentUser.setRoles(studentRoles);
        // Thay setActive bằng setStatus
        studentUser.setStatus(Status.ACTIVE);
        studentUser.setCreatedAt(LocalDateTime.now());
        usersRepository.save(studentUser);

        testStudent = new Student();
        testStudent.setUser(studentUser);
        // Loại bỏ setLevel, thay thế bằng thuộc tính có trong StudentService
        testStudent.setFatherName("Father Name");
        testStudent.setFatherPhone("0123456789");
        testStudent.setMotherName("Mother Name");
        testStudent.setMotherPhone("0123456789");
        testStudent.setApplication("Application Test");
        studentRepository.save(testStudent);

        // Tạo khóa học test
        testCourse = new Course();
        testCourse.setTitle("Khóa học tiếng Anh giao tiếp");
        testCourse.setDescription("Khóa học dành cho người muốn nâng cao kỹ năng giao tiếp");
        testCourse.setOnline(false);
        testCourse.setStartDate(LocalDate.now().plusDays(7));
        testCourse.setEndDate(LocalDate.now().plusDays(37));
        testCourse.setTeacher(testTeacher);
        testCourse.setActive(true);

        // Thêm lịch học cho khóa học
        List<CourseSchedule> schedules = new ArrayList<>();
        CourseSchedule schedule1 = new CourseSchedule();
        schedule1.setCourse(testCourse);
        schedule1.setDayOfWeek(DayOfWeek.MONDAY);
        schedule1.setTimeSlot(TimeSlot.SLOT_1);

        CourseSchedule schedule2 = new CourseSchedule();
        schedule2.setCourse(testCourse);
        schedule2.setDayOfWeek(DayOfWeek.WEDNESDAY);
        schedule2.setTimeSlot(TimeSlot.SLOT_1);

        schedules.add(schedule1);
        schedules.add(schedule2);
        testCourse.setSchedules(schedules);

        Course savedCourse = courseRepository.save(testCourse);
        // Đảm bảo schedules được lưu thành công
        testCourse = savedCourse;

        // Tạo UserDetails từ Users để tạo JWT token
        UserDetails userDetails = new User(
            studentUser.getEmail(),
            "", // password không cần thiết vì đang test
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );

        // Tạo JWT token để sử dụng trong các test
        authToken = "Bearer " + jwtUtil.generateToken(userDetails);
    }

    @Test
    @DisplayName("Đăng ký học sinh vào khóa học thành công")
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    public void testEnrollStudentToCourse_Success() throws Exception {
        // Tạo request đăng ký học sinh vào khóa học
        EnrollmentRequest request = new EnrollmentRequest();
        request.setStudentId(testStudent.getId());
        request.setCourseId(testCourse.getId());

        // Gọi API đăng ký khóa học
        ResultActions response = mockMvc.perform(post("/api/enrollments/enroll")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", authToken));

        // Kiểm tra kết quả
        response.andExpect(status().isCreated())
                .andExpect(jsonPath("$.statusCode").value(StatusApplication.SUCCESS.getCode()))
                .andExpect(jsonPath("$.message").value("Đăng ký học sinh vào khóa học thành công"))
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.studentId").value(testStudent.getId()))
                .andExpect(jsonPath("$.data.courseId").value(testCourse.getId()))
                .andExpect(jsonPath("$.data.studentName").value(testStudent.getUser().getFullName()))
                .andExpect(jsonPath("$.data.courseName").value(testCourse.getTitle()));

        // Kiểm tra xem đăng ký đã được lưu trong database chưa
        boolean exists = enrollmentRepository.existsByStudentIdAndCourseId(testStudent.getId(), testCourse.getId());
        assertTrue(exists, "Đăng ký học sinh vào khóa học phải tồn tại trong database");
    }

    @Test
    @DisplayName("Không cho phép đăng ký vào khóa học đã đăng ký")
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    public void testEnrollStudentToCourse_AlreadyEnrolled() throws Exception {
        // Tạo đăng ký sẵn trong database
        Enrollment existingEnrollment = new Enrollment();
        existingEnrollment.setStudent(testStudent);
        existingEnrollment.setCourse(testCourse);
        existingEnrollment.setEnrolledAt(java.time.LocalDateTime.now());
        enrollmentRepository.save(existingEnrollment);

        // Tạo request đăng ký học sinh vào khóa học
        EnrollmentRequest request = new EnrollmentRequest();
        request.setStudentId(testStudent.getId());
        request.setCourseId(testCourse.getId());

        // Gọi API đăng ký khóa học
        ResultActions response = mockMvc.perform(post("/api/enrollments/enroll")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", authToken));

        // Kiểm tra kết quả - phải trả về lỗi đã đăng ký
        response.andExpect(status().isConflict())
                .andExpect(jsonPath("$.statusCode").value(StatusApplication.BAD_REQUEST.getCode()))
                .andExpect(jsonPath("$.message").value("Học sinh này đã được đăng ký vào khóa học"));
    }

    @Test
    @DisplayName("Kiểm tra xung đột lịch học khi đăng ký")
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    public void testEnrollStudentToCourse_ScheduleConflict() throws Exception {
        // Tạo khóa học có lịch học trùng với khóa học đã tạo
        Course conflictCourse = new Course();
        conflictCourse.setTitle("Khóa học khác với lịch trùng");
        conflictCourse.setDescription("Khóa học này có lịch trùng với khóa học đã tạo");
        conflictCourse.setOnline(true);
        conflictCourse.setStartDate(LocalDate.now().plusDays(10));
        conflictCourse.setEndDate(LocalDate.now().plusDays(40));
        conflictCourse.setTeacher(testTeacher);
        conflictCourse.setActive(true);

        // Thêm lịch học trùng với khóa học đã tạo
        List<CourseSchedule> schedules = new ArrayList<>();
        CourseSchedule schedule = new CourseSchedule();
        schedule.setCourse(conflictCourse);
        schedule.setDayOfWeek(DayOfWeek.MONDAY);  // Trùng thứ
        schedule.setTimeSlot(TimeSlot.SLOT_1);    // Trùng giờ
        schedules.add(schedule);

        conflictCourse.setSchedules(schedules);
        courseRepository.save(conflictCourse);

        // Trước tiên đăng ký học sinh vào khóa học đầu tiên
        Enrollment firstEnrollment = new Enrollment();
        firstEnrollment.setStudent(testStudent);
        firstEnrollment.setCourse(testCourse);
        firstEnrollment.setEnrolledAt(java.time.LocalDateTime.now());
        enrollmentRepository.save(firstEnrollment);

        // Tạo request đăng ký học sinh vào khóa học thứ hai
        EnrollmentRequest request = new EnrollmentRequest();
        request.setStudentId(testStudent.getId());
        request.setCourseId(conflictCourse.getId());

        // Gọi API đăng ký khóa học
        ResultActions response = mockMvc.perform(post("/api/enrollments/enroll")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", authToken));

        // Kiểm tra kết quả - phải trả về lỗi lịch học trùng
        response.andExpect(status().isConflict())
                .andExpect(jsonPath("$.statusCode").value(StatusApplication.SCHEDULE_CONFLICT.getCode()))
                .andExpect(jsonPath("$.message").value("Phát hiện lịch học bị trùng. Vui lòng kiểm tra lịch học!"));
    }

    @Test
    @DisplayName("Lấy danh sách học sinh trong khóa học")
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    public void testGetStudentsByCourse_Success() throws Exception {
        // Tạo thêm một học sinh
        Users studentUser2 = new Users();
        studentUser2.setEmail("student2@example.com");
        studentUser2.setFullName("Test Student 2");
        studentUser2.setPhoneNumber("0123789456");
        // Thay setRole bằng setRoles với Set<Role>
        Set<Role> studentRoles2 = new HashSet<>();
        studentRoles2.add(Role.STUDENT);
        studentUser2.setRoles(studentRoles2);
        // Thay setActive bằng setStatus
        studentUser2.setStatus(Status.ACTIVE);
        studentUser2.setCreatedAt(LocalDateTime.now());
        usersRepository.save(studentUser2);

        Student testStudent2 = new Student();
        testStudent2.setUser(studentUser2);
        // Loại bỏ setLevel, thay thế bằng thuộc tính có trong StudentService
        testStudent2.setFatherName("Father Name 2");
        testStudent2.setFatherPhone("0987654321");
        testStudent2.setMotherName("Mother Name 2");
        testStudent2.setMotherPhone("0987654321");
        testStudent2.setApplication("Application Test 2");
        studentRepository.save(testStudent2);

        // Đăng ký cả 2 học sinh vào khóa học
        Enrollment enrollment1 = new Enrollment();
        enrollment1.setStudent(testStudent);
        enrollment1.setCourse(testCourse);
        enrollment1.setEnrolledAt(java.time.LocalDateTime.now());
        enrollmentRepository.save(enrollment1);

        Enrollment enrollment2 = new Enrollment();
        enrollment2.setStudent(testStudent2);
        enrollment2.setCourse(testCourse);
        enrollment2.setEnrolledAt(java.time.LocalDateTime.now());
        enrollmentRepository.save(enrollment2);

        // Gọi API lấy danh sách học sinh trong khóa học
        ResultActions response = mockMvc.perform(get("/api/enrollments/course/" + testCourse.getId() + "/students")
                .header("Authorization", authToken));

        // Kiểm tra kết quả
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(StatusApplication.SUCCESS.getCode()))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].fullName").exists())
                .andExpect(jsonPath("$.data[0].email").exists())
                .andExpect(jsonPath("$.data[0].phone").exists())
                .andExpect(jsonPath("$.data[0].enrolledAt").exists());
    }
}
