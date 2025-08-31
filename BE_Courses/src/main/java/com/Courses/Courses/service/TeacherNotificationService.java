package com.Courses.Courses.service;

import com.Courses.Courses.enums.NotificationType;
import com.Courses.Courses.model.dto.NotificationDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeacherNotificationService {
    private static final Logger log = LoggerFactory.getLogger(TeacherNotificationService.class);

    @Autowired
    private NotificationService notificationService;

    /**
     * Gửi thông báo khi khóa học mới được tạo
     * @param teacherId ID của giảng viên
     * @param courseId ID của khóa học
     * @param courseName Tên khóa học
     */
    @Transactional
    public NotificationDto notifyCourseCreated(Long teacherId, Long courseId, String courseName) {
        String title = "Khóa học mới được tạo";
        String message = "Khóa học \"" + courseName + "\" đã được tạo thành công.";
        return notificationService.createAndSendNotification(teacherId, title, message, NotificationType.COURSE_CREATED, courseId);
    }

    /**
     * Gửi thông báo khi khóa học được cập nhật
     * @param teacherId ID của giảng viên
     * @param courseId ID của khóa học
     * @param courseName Tên khóa học
     */
    @Transactional
    public NotificationDto notifyCourseUpdated(Long teacherId, Long courseId, String courseName) {
        String title = "Khóa học được cập nhật";
        String message = "Khóa học \"" + courseName + "\" đã được cập nhật.";
        return notificationService.createAndSendNotification(teacherId, title, message, NotificationType.COURSE_UPDATED, courseId);
    }

    /**
     * Gửi thông báo khi khóa học bị xóa
     * @param teacherId ID của giảng viên
     * @param courseName Tên khóa học
     */
    @Transactional
    public NotificationDto notifyCourseDeleted(Long teacherId, String courseName) {
        String title = "Khóa học đã bị xóa";
        String message = "Khóa học \"" + courseName + "\" đã bị xóa.";
        return notificationService.createAndSendNotification(teacherId, title, message, NotificationType.COURSE_DELETED, null);
    }

    /**
     * Gửi thông báo khi có học viên mới tham gia khóa học
     * @param teacherId ID của giảng viên
     * @param courseId ID của khóa học
     * @param courseName Tên khóa học
     * @param studentName Tên học viên
     */
    @Transactional
    public NotificationDto notifyStudentEnrolled(Long teacherId, Long courseId, String courseName, String studentName) {
        String title = "Học viên mới tham gia khóa học";
        String message = "Học viên \"" + studentName + "\" đã tham gia vào khóa học \"" + courseName + "\".";
        return notificationService.createAndSendNotification(teacherId, title, message, NotificationType.STUDENT_ENROLLED, courseId);
    }

    /**
     * Gửi thông báo khi có phản hồi mới về khóa học
     * @param teacherId ID của giảng viên
     * @param courseId ID của khóa học
     * @param courseName Tên khóa học
     * @param studentName Tên học viên đã phản hồi
     */
    @Transactional
    public NotificationDto notifyCourseFeedback(Long teacherId, Long courseId, String courseName, String studentName) {
        String title = "Phản hồi mới về khóa học";
        String message = "Học viên \"" + studentName + "\" đã gửi phản hồi mới về khóa học \"" + courseName + "\".";
        return notificationService.createAndSendNotification(teacherId, title, message, NotificationType.COURSE_FEEDBACK, courseId);
    }

    /**
     * Gửi thông báo khi bài học mới được thêm vào khóa học
     * @param teacherId ID của giảng viên
     * @param lessonId ID của bài học
     * @param lessonName Tên bài học
     * @param courseName Tên khóa học
     */
    @Transactional
    public NotificationDto notifyLessonCreated(Long teacherId, Long lessonId, String lessonName, String courseName) {
        String title = "Bài học mới được thêm";
        String message = "Bài học \"" + lessonName + "\" đã được thêm vào khóa học \"" + courseName + "\".";
        return notificationService.createAndSendNotification(teacherId, title, message, NotificationType.LESSON_CREATED, lessonId);
    }

    /**
     * Gửi thông báo khi bài tập mới được giao
     * @param teacherId ID của giảng viên
     * @param assignmentId ID của bài tập
     * @param assignmentName Tên bài tập
     * @param courseName Tên khóa học
     */
    @Transactional
    public NotificationDto notifyAssignmentCreated(Long teacherId, Long assignmentId, String assignmentName, String courseName) {
        String title = "Bài tập mới được giao";
        String message = "Bài tập \"" + assignmentName + "\" đã được giao cho khóa học \"" + courseName + "\".";
        return notificationService.createAndSendNotification(teacherId, title, message, NotificationType.ASSIGNMENT_CREATED, assignmentId);
    }

    /**
     * Gửi thông báo khi bài tập được cập nhật
     * @param teacherId ID của giảng viên
     * @param assignmentId ID của bài tập
     * @param assignmentName Tên bài tập
     */
    @Transactional
    public NotificationDto notifyAssignmentUpdated(Long teacherId, Long assignmentId, String assignmentName) {
        String title = "Bài tập được cập nhật";
        String message = "Bài tập \"" + assignmentName + "\" đã được cập nhật.";
        return notificationService.createAndSendNotification(teacherId, title, message, NotificationType.ASSIGNMENT_UPDATED, assignmentId);
    }

    /**
     * Gửi thông báo khi học viên nộp bài tập
     * @param teacherId ID của giảng viên
     * @param assignmentId ID của bài tập
     * @param assignmentName Tên bài tập
     * @param studentName Tên học viên
     */
    @Transactional
    public NotificationDto notifyAssignmentSubmitted(Long teacherId, Long assignmentId, String assignmentName, String studentName) {
        String title = "Bài tập đã được nộp";
        String message = "Học viên \"" + studentName + "\" đã nộp bài tập \"" + assignmentName + "\".";
        return notificationService.createAndSendNotification(teacherId, title, message, NotificationType.ASSIGNMENT_SUBMITTED, assignmentId);
    }

    /**
     * Gửi thông báo khi bài kiểm tra mới được tạo
     * @param teacherId ID của giảng viên
     * @param examId ID của bài kiểm tra
     * @param examName Tên bài kiểm tra
     */
    @Transactional
    public NotificationDto notifyExamCreated(Long teacherId, Long examId, String examName) {
        String title = "Bài kiểm tra mới được tạo";
        String message = "Bài kiểm tra \"" + examName + "\" đã được tạo thành công.";
        return notificationService.createAndSendNotification(teacherId, title, message, NotificationType.EXAM_CREATED, examId);
    }

    /**
     * Gửi thông báo khi bài kiểm tra được cập nhật
     * @param teacherId ID của giảng viên
     * @param examId ID của bài kiểm tra
     * @param examName Tên bài kiểm tra
     */
    @Transactional
    public NotificationDto notifyExamUpdated(Long teacherId, Long examId, String examName) {
        String title = "Bài kiểm tra được cập nhật";
        String message = "Bài kiểm tra \"" + examName + "\" đã được cập nhật.";
        return notificationService.createAndSendNotification(teacherId, title, message, NotificationType.EXAM_UPDATED, examId);
    }

    /**
     * Gửi thông báo khi bài kiểm tra bị xóa
     * @param teacherId ID của giảng viên
     * @param examName Tên bài kiểm tra
     */
    @Transactional
    public NotificationDto notifyExamDeleted(Long teacherId, String examName) {
        String title = "Bài kiểm tra đã bị xóa";
        String message = "Bài kiểm tra \"" + examName + "\" đã bị xóa.";
        return notificationService.createAndSendNotification(teacherId, title, message, NotificationType.EXAM_DELETED, null);
    }

    /**
     * Gửi thông báo khi có kết quả bài kiểm tra
     * @param teacherId ID của giảng viên
     * @param examId ID của bài kiểm tra
     * @param examName Tên bài kiểm tra
     * @param studentName Tên học viên
     * @param score Điểm số
     */
    @Transactional
    public NotificationDto notifyExamResult(Long teacherId, Long examId, String examName, String studentName, Double score) {
        String title = "Kết quả bài kiểm tra";
        String message = "Học viên \"" + studentName + "\" đã hoàn thành bài kiểm tra \"" +
                examName + "\" với số điểm: " + score;
        return notificationService.createAndSendNotification(teacherId, title, message, NotificationType.EXAM_RESULT, examId);
    }
}
