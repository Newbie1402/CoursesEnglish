package com.Courses.Courses.service;

import com.Courses.Courses.model.dto.CourseDto;
import com.Courses.Courses.model.entity.Course;
import com.Courses.Courses.model.entity.Teacher;
import com.Courses.Courses.model.request.CourseCreateRequest;
import com.Courses.Courses.repository.CourseRepository;
import com.Courses.Courses.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private TeacherRepository teacherRepository;

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

    // Lấy thông tin khoá học theo id
    public CourseDto getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .filter(Course::isActive)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoá học với id: " + id));
        return toDto(course);
    }

    // Sửa thông tin khoá học
    @Transactional
    public CourseDto updateCourse(Long id, CourseCreateRequest request) {
        Course course = courseRepository.findById(id)
                .filter(Course::isActive)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoá học với id: " + id));
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setOnline(request.getOnline());
        course.setStartDate(request.getStartDate());
        course.setEndDate(request.getEndDate());
        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giáo viên với id: " + request.getTeacherId()));
        course.setTeacher(teacher);
        courseRepository.save(course);
        return toDto(course);
    }

    // Inactive khoá học
    @Transactional
    public void setActiveStatus(Long id, boolean active) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoá học với id: " + id));
        course.setActive(active);
        courseRepository.save(course);
    }


    /**
     * Thêm mới khoá học
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
        return toDto(course);
    }

    private CourseDto toDto(Course course) {
        return CourseDto.builder()
                .CourseId(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .online(course.isOnline())
                .startDate(course.getStartDate())
                .endDate(course.getEndDate())
                .teacherId(course.getTeacher() != null ? course.getTeacher().getId() : null)
                .active(course.isActive())
                .build();
    }
}
