package com.Courses.Courses.service;

import com.Courses.Courses.model.dto.CourseDto;
import com.Courses.Courses.model.dto.CourseScheduleDto;
import com.Courses.Courses.model.entity.Course;
import com.Courses.Courses.model.entity.CourseSchedule;
import com.Courses.Courses.model.entity.Teacher;
import com.Courses.Courses.model.request.CourseCreateRequest;
import com.Courses.Courses.model.request.CourseScheduleRequest;
import com.Courses.Courses.model.request.CourseUpdateRequest;
import com.Courses.Courses.repository.CourseRepository;
import com.Courses.Courses.repository.CourseScheduleRepository;
import com.Courses.Courses.repository.StudentRepository;
import com.Courses.Courses.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {
    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseScheduleRepository courseScheduleRepository;

    @Autowired
    private TeacherNotificationService teacherNotificationService;

    @Autowired
    private StudentNotificationService studentNotificationService;

    @Autowired
    private AdminNotificationService adminNotificationService;

    // Lấy danh sách tất cả khoá học đang active
    public List<CourseDto> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        return courses.stream()
                .filter(Course::isActive)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả khoá học (bao gồm cả active và inactive)
     * @return Danh sách CourseDto
     */
    @Transactional(readOnly = true)
    public List<CourseDto> getFULLCourses() {
        List<Course> courses = courseRepository.findAll();
        return courses.stream().map(this::toDto).toList();
    }

    /**
     * Lấy danh sách khoá học đang active theo ID của giáo viên
     * @param teacherId ID của giáo viên
     */
    @Transactional(readOnly = true)
    public List<CourseDto> getActiveCoursesForTeacher(Long teacherId) {
        // Kiểm tra giáo viên có tồn tại không
        teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giáo viên với id: " + teacherId));

        // Lấy danh sách khoá học active của giáo viên
        List<Course> courses = courseRepository.findByTeacherIdAndActiveTrue(teacherId);
        return courses.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách khoá học đang active theo ID của Học viên
     * @param studentId ID của Học viên
     */
    @Transactional(readOnly = true)
    public List<CourseDto> getActiveCoursesForStudent(Long studentId) {
        studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Học viên với id: " + studentId));

        // Lấy danh sách khoá học active của Học viên
        List<Course> courses = courseRepository.findByEnrollments_Student_IdAndActiveTrue(studentId);
        return courses.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }


    // Lấy thông tin khoá học theo id
    public CourseDto getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .filter(Course::isActive)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoá học với id: " + id));
        return toDto(course);
    }

    // Sửa thông tin khoá học
    @Transactional
    public CourseDto updateCourse(Long id, CourseUpdateRequest request) {
        Course course = courseRepository.findById(id)
                .filter(Course::isActive)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoá học với id: " + id));

        String teacherName = course.getTeacher().getUser().getFullName();

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setOnline(request.getOnline());
        course.setStartDate(request.getStartDate());
        course.setEndDate(request.getEndDate());
        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giáo viên với id: " + request.getTeacherId()));
        course.setTeacher(teacher);
        course.getSchedules().clear();
        for (CourseScheduleRequest scheduleRequest : request.getSchedules()) {
            CourseSchedule schedule = new CourseSchedule();
            schedule.setCourse(course);
            schedule.setDayOfWeek(scheduleRequest.getDayOfWeek());
            schedule.setTimeSlot(scheduleRequest.getTimeSlot());
            course.getSchedules().add(schedule);
        }

        Course updatedCourse = courseRepository.save(course);

        teacherNotificationService.notifyCourseUpdated(
                updatedCourse.getTeacher().getId(),
                updatedCourse.getId(),
                updatedCourse.getTitle()
        );

        adminNotificationService.notifyCourseUpdated(
                updatedCourse.getId(),
                updatedCourse.getTitle(),
                teacherName,
                "Cập nhật thông tin và lịch học"
        );

        return toDto(updatedCourse);
    }


    // Inactive khoá học
    @Transactional
    public void setActiveStatus(Long id, boolean active) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoá học với id: " + id));
        course.setActive(active);
        courseRepository.save(course);

        adminNotificationService.notifyCourseDeleted(
                course.getTitle(),
                course.getTeacher().getUser().getFullName(),
                active ? "Khôi phục khoá học" : "Khoá học bị vô hiệu hoá"
        );
    }


    /**
     * Thêm mới khoá h��c
     * @param request Thông tin tạo khoá học
     * @return CourseDto
     */
    @Transactional
    public CourseDto createCourse(CourseCreateRequest request) {
        // Kiểm tra giáo viên tồn tại
        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giáo viên với id: " + request.getTeacherId()));
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setOnline(request.getOnline());
        course.setStartDate(request.getStartDate());
        course.setEndDate(request.getEndDate());
        course.setTeacher(teacher);
        course.setActive(true);

        courseRepository.save(course);

        List<CourseSchedule> schedules = new ArrayList<>();
        for (CourseScheduleRequest scheduleRequest : request.getSchedules()) {
            CourseSchedule schedule = new CourseSchedule();
            schedule.setCourse(course);
            schedule.setDayOfWeek(scheduleRequest.getDayOfWeek());
            schedule.setTimeSlot(scheduleRequest.getTimeSlot());
            schedules.add(schedule);
        }
        course.setSchedules(schedules);

        Course savedCourse = courseRepository.save(course);
        teacherNotificationService.notifyCourseCreated(
                teacher.getId(),
                savedCourse.getId(),
                savedCourse.getTitle()
        );

        adminNotificationService.notifyCourseCreated(
                savedCourse.getId(),
                savedCourse.getTitle(),
                teacher.getUser().getFullName()
        );

        return toDto(savedCourse);
    }


    @Transactional
    public void processFeedback(Long courseId, Long studentId, String studentName, String feedback) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học với ID: " + courseId));
        teacherNotificationService.notifyCourseFeedback(
                course.getTeacher().getId(),
                course.getId(),
                course.getTitle(),
                studentName
        );
    }

    private CourseDto toDto(Course course) {
        CourseDto dto = CourseDto.builder()
                .CourseId(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .online(course.isOnline())
                .startDate(course.getStartDate())
                .endDate(course.getEndDate())
                .teacherId(course.getTeacher() != null ? course.getTeacher().getId() : null)
                .active(course.isActive())
                .schedules(new ArrayList<>())
                .build();
        if (course.getSchedules() != null) {
            List<CourseScheduleDto> scheduleDtos = course.getSchedules().stream()
                    .map(schedule -> CourseScheduleDto.builder()
                            .id(schedule.getId())
                            .dayOfWeek(schedule.getDayOfWeek())
                            .timeSlot(schedule.getTimeSlot())
                            .timeRange(schedule.getTimeSlot() != null ? schedule.getTimeSlot().getTimeRange() : null)
                            .build())
                    .collect(Collectors.toList());
            dto.setSchedules(scheduleDtos);
        }

        return dto;
    }
}
