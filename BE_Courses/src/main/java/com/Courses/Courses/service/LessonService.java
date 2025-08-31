package com.Courses.Courses.service;

import com.Courses.Courses.model.dto.LessonDto;
import com.Courses.Courses.model.entity.Course;
import com.Courses.Courses.model.entity.Lesson;
import com.Courses.Courses.repository.CourseRepository;
import com.Courses.Courses.repository.LessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LessonService {
    @Autowired
    private S3Service s3Service;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Xử lý upload file, lưu bài học mới và trả về LessonDto
     */
    @Transactional
    public LessonDto createLesson(String title, MultipartFile file, Long courseId) throws IOException {
        String fileUrl = s3Service.uploadFile(file);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoá học với id: " + courseId));

        Lesson lesson = new Lesson();
        lesson.setTitle(title);
        lesson.setContentUrl(fileUrl);
        lesson.setUploadedAt(LocalDateTime.now());
        lesson.setCourse(course);
        lessonRepository.save(lesson);
        notificationService.notifyLessonCreated(
                course.getTeacher().getId(),
                lesson.getId(),
                lesson.getTitle(),
                course.getTitle()
        );

        return convertToDto(lesson);
    }

    /**
     * Lấy tất cả bài giảng (kể cả active/inactive)
     */
    public List<LessonDto> getAllLessons() {
        return lessonRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả bài giảng chỉ active
     */
    public List<LessonDto> getAllActiveLessons() {
        return lessonRepository.findAll().stream()
                .filter(lesson -> Boolean.TRUE.equals(lesson.getActive()))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết 1 bài giảng theo id
     */
    public LessonDto getLessonById(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài giảng với id: " + id));
        return convertToDto(lesson);
    }

    /**
     * Cập nhật thông tin bài giảng (title, file mới, courseId)
     */
    @Transactional
    public LessonDto updateLesson(Long id, String title, MultipartFile file, Long courseId) throws IOException {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài giảng với id: " + id));
        lesson.setTitle(title);
        if (file != null && !file.isEmpty()) {
            String fileUrl = s3Service.uploadFile(file);
            lesson.setContentUrl(fileUrl);
        }
        if (courseId != null) {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khoá học với id: " + courseId));
            lesson.setCourse(course);
        }
        lessonRepository.save(lesson);
        return convertToDto(lesson);
    }

    /**
     * Đổi trạng thái active/inactive cho bài giảng
     */
    @Transactional
    public LessonDto setLessonActive(Long id, boolean active) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài giảng với id: " + id));
        lesson.setActive(active);
        lessonRepository.save(lesson);
        return convertToDto(lesson);
    }

    /**
     * Lấy tất cả bài học của một khóa học (bao gồm cả active và inactive)
     */
    @Transactional(readOnly = true)
    public List<LessonDto> getLessonsByCourseId(Long courseId) {
        // Kiểm tra khóa học tồn tại
        courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học với id: " + courseId));

        return lessonRepository.findByCourseId(courseId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả bài học đang active của một khóa học
     */
    @Transactional(readOnly = true)
    public List<LessonDto> getActiveLessonsByCourseId(Long courseId) {
        // Kiểm tra khóa học tồn tại
        courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học với id: " + courseId));

        return lessonRepository.findByCourseIdAndActiveTrue(courseId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }


    private LessonDto convertToDto(Lesson lesson) {
        if (lesson == null) return null;
        return LessonDto.builder()
                .lessonId(lesson.getId())
                .title(lesson.getTitle())
                .contentUrl(lesson.getContentUrl())
                .courseId(lesson.getCourse() != null ? lesson.getCourse().getId() : null)
                .uploadedAt(lesson.getUploadedAt())
                .active(lesson.getActive())
                .build();
    }
}
