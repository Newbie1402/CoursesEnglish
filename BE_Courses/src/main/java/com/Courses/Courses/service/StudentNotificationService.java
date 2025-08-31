package com.Courses.Courses.service;

import com.Courses.Courses.enums.NotificationType;
import com.Courses.Courses.model.dto.NotificationDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentNotificationService {
    private static final Logger log = LoggerFactory.getLogger(StudentNotificationService.class);

    @Autowired
    private NotificationService notificationService;

    /**
     * Gửi thông báo khi khóa học được cập nhật đến tất cả học viên trong khóa học
     * @param studentIds Danh sách ID của học viên trong khóa học
     * @param courseId ID của khóa học
     * @param courseName Tên khóa học
     * @param updatedInfo Thông tin đã cập nhật (ví dụ: lịch học, nội dung,...)
     */
    @Transactional
    public void notifyCourseUpdated(List<Long> studentIds, Long courseId, String courseName, String updatedInfo) {
        String title = "Khóa học đã được cập nhật";
        String message = "Khóa học \"" + courseName + "\" đã được cập nhật: " + updatedInfo;

        for (Long studentId : studentIds) {
            notificationService.createAndSendNotification(
                    studentId,
                    title,
                    message,
                    NotificationType.STUDENT_COURSE_UPDATED,
                    courseId
            );
        }

        log.info("Đã gửi thông báo cập nhật khóa học {} cho {} học viên", courseName, studentIds.size());
    }

    /**
     * Gửi thông báo khi khóa học bị xóa đến tất cả học viên trong khóa học
     * @param studentIds Danh sách ID của học viên trong khóa học
     * @param courseName Tên khóa học
     * @param reason Lý do xóa khóa học (nếu có)
     */
    @Transactional
    public void notifyCourseDeleted(List<Long> studentIds, String courseName, String reason) {
        String title = "Khóa học đã bị xóa";
        String message = "Khóa học \"" + courseName + "\" đã bị xóa";
        if (reason != null && !reason.isEmpty()) {
            message += ". Lý do: " + reason;
        }

        for (Long studentId : studentIds) {
            notificationService.createAndSendNotification(
                    studentId,
                    title,
                    message,
                    NotificationType.STUDENT_COURSE_DELETED,
                    null
            );
        }

        log.info("Đã gửi thông báo xóa khóa học {} cho {} học viên", courseName, studentIds.size());
    }

    /**
     * Gửi thông báo từ giảng viên về khóa học đến tất cả học viên
     * @param studentIds Danh sách ID của học viên trong khóa học
     * @param courseId ID của khóa học
     * @param courseName Tên khóa học
     * @param announcement Nội dung thông báo
     * @param teacherName Tên giảng viên
     */
    @Transactional
    public void notifyCourseAnnouncement(List<Long> studentIds, Long courseId, String courseName,
                                        String announcement, String teacherName) {
        String title = "Thông báo mới từ giảng viên";
        String message = "Giảng viên " + teacherName + " gửi thông báo về khóa học \"" +
                         courseName + "\": " + announcement;

        for (Long studentId : studentIds) {
            notificationService.createAndSendNotification(
                    studentId,
                    title,
                    message,
                    NotificationType.STUDENT_COURSE_ANNOUNCEMENT,
                    courseId
            );
        }

        log.info("Đã gửi thông báo từ giảng viên về khóa học {} cho {} học viên", courseName, studentIds.size());
    }

    /**
     * Gửi thông báo khi bài học mới được thêm vào khóa học đến tất cả học viên
     * @param studentIds Danh sách ID của học viên trong khóa học
     * @param courseId ID của khóa học
     * @param courseName Tên khóa học
     * @param lessonId ID của bài học
     * @param lessonName Tên bài học
     */
    @Transactional
    public void notifyLessonAdded(List<Long> studentIds, Long courseId, String courseName,
                                Long lessonId, String lessonName) {
        String title = "Bài học mới được thêm vào khóa học";
        String message = "Bài học mới \"" + lessonName + "\" đã được thêm vào khóa học \"" + courseName + "\".";

        for (Long studentId : studentIds) {
            notificationService.createAndSendNotification(
                    studentId,
                    title,
                    message,
                    NotificationType.STUDENT_LESSON_ADDED,
                    lessonId
            );
        }

        log.info("Đã gửi thông báo thêm bài học mới {} vào khóa học {} cho {} học viên",
                lessonName, courseName, studentIds.size());
    }

    /**
     * Gửi thông báo khi bài kiểm tra mới được tạo đến tất cả học viên trong khóa học
     * @param studentIds Danh sách ID của học viên trong khóa học
     * @param courseId ID của khóa học
     * @param courseName Tên khóa học
     * @param examId ID của bài kiểm tra
     * @param examName Tên bài kiểm tra
     * @param examDate Ngày thi
     */
    @Transactional
    public void notifyExamCreated(List<Long> studentIds, Long courseId, String courseName,
                                Long examId, String examName, String examDate) {
        String title = "Bài kiểm tra mới được tạo";
        String message = "Bài kiểm tra mới \"" + examName + "\" đã được tạo cho khóa học \"" +
                         courseName + "\". Thời gian: " + examDate;

        for (Long studentId : studentIds) {
            notificationService.createAndSendNotification(
                    studentId,
                    title,
                    message,
                    NotificationType.STUDENT_EXAM_CREATED,
                    examId
            );
        }

        log.info("Đã gửi thông báo tạo bài kiểm tra {} cho khóa học {} cho {} học viên",
                examName, courseName, studentIds.size());
    }

    /**
     * Gửi thông báo khi bài kiểm tra được cập nhật đến tất cả học viên trong khóa học
     * @param studentIds Danh sách ID của học viên trong khóa học
     * @param courseId ID của khóa học
     * @param examId ID của bài kiểm tra
     * @param examName Tên bài kiểm tra
     * @param updatedInfo Thông tin đã cập nhật
     */
    @Transactional
    public void notifyExamUpdated(List<Long> studentIds, Long courseId, Long examId,
                                String examName, String updatedInfo) {
        String title = "Bài kiểm tra đã được cập nhật";
        String message = "Bài kiểm tra \"" + examName + "\" đã được cập nhật: " + updatedInfo;

        for (Long studentId : studentIds) {
            notificationService.createAndSendNotification(
                    studentId,
                    title,
                    message,
                    NotificationType.STUDENT_EXAM_UPDATED,
                    examId
            );
        }

        log.info("Đã gửi thông báo cập nhật bài kiểm tra {} cho {} học viên", examName, studentIds.size());
    }

    /**
     * Gửi thông báo khi bài kiểm tra bị xóa đến tất cả học viên trong khóa học
     * @param studentIds Danh sách ID của học viên trong khóa học
     * @param courseName Tên khóa học
     * @param examName Tên bài kiểm tra
     */
    @Transactional
    public void notifyExamDeleted(List<Long> studentIds, String courseName, String examName) {
        String title = "Bài kiểm tra đã bị xóa";
        String message = "Bài kiểm tra \"" + examName + "\" của khóa học \"" + courseName + "\" đã bị xóa.";

        for (Long studentId : studentIds) {
            notificationService.createAndSendNotification(
                    studentId,
                    title,
                    message,
                    NotificationType.STUDENT_EXAM_DELETED,
                    null
            );
        }

        log.info("Đã gửi thông báo xóa bài kiểm tra {} cho {} học viên", examName, studentIds.size());
    }

    /**
     * Gửi thông báo kết quả bài kiểm tra cho học viên
     * @param studentId ID của học viên
     * @param examId ID của bài kiểm tra
     * @param examName Tên bài kiểm tra
     * @param courseName Tên khóa học
     * @param score Điểm số
     */
    @Transactional
    public NotificationDto notifyExamResult(Long studentId, Long examId, String examName, String courseName, Double score) {
        String title = "Kết quả bài kiểm tra đã có";
        String message = "Kết quả bài kiểm tra \"" + examName + "\" thuộc khóa học \"" +
                         courseName + "\" của bạn: " + score + " điểm.";

        NotificationDto notification = notificationService.createAndSendNotification(
                studentId,
                title,
                message,
                NotificationType.STUDENT_EXAM_RESULT,
                examId
        );

        log.info("Đã gửi thông báo kết quả bài kiểm tra {} cho học viên {}: {} điểm",
                examName, studentId, score);

        return notification;
    }
}
