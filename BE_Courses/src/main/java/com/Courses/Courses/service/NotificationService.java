package com.Courses.Courses.service;

import com.Courses.Courses.enums.NotificationType;
import com.Courses.Courses.model.dto.NotificationDto;
import com.Courses.Courses.model.entity.Notification;
import com.Courses.Courses.model.entity.Users;
import com.Courses.Courses.model.event.NotificationEvent;
import com.Courses.Courses.repository.NotificationRepository;
import com.Courses.Courses.repository.UsersRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UsersRepository userRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Tạo và lưu thông báo mới, đồng thời gửi thông qua Kafka
     */
    @Transactional
    public NotificationDto createAndSendNotification(Long userId, String title, String message,
                                                     String type, Long entityId) {
        try {
            // Tìm user
            Users user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

            // Tạo thông báo và lưu vào DB
            Notification notification = Notification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .type(type)
                    .entityId(entityId)
                    .isRead(false)
                    .sentViaWebsocket(false)
                    .retryCount(0)
                    .build();

            notification = notificationRepository.save(notification);

            // Gửi event notification qua Kafka
            NotificationEvent event = NotificationEvent.builder()
                    .userId(userId)
                    .title(title)
                    .message(message)
                    .type(type)
                    .entityId(entityId)
                    .build();

            kafkaTemplate.send("user-notifications", String.valueOf(userId), event);
            log.info("Đã gửi thông báo tới Kafka cho userId: {}, title: {}", userId, title);

            return convertToDto(notification);
        } catch (Exception e) {
            log.error("Lỗi khi tạo và gửi thông báo: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi khi gửi thông báo: " + e.getMessage(), e);
        }
    }

    /**
     * Tạo và lưu thông báo mới
     */
    @Transactional
    public NotificationDto createAndSendNotification(Long userId, String title, String message,
                                                     NotificationType type, Long entityId) {
        return createAndSendNotification(userId, title, message, type.getCode(), entityId);
    }

    /**
     * Lấy danh sách thông báo của một user
     */
    public Page<NotificationDto> getUserNotifications(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return notifications.map(this::convertToDto);
    }

    /**
     * Lấy số thông báo chưa đọc của một user
     */
    public long countUnreadNotifications(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Đánh dấu một thông báo là đã đọc
     * @param notificationId ID của thông báo
     * @param currentUserId ID của người dùng hiện tại để kiểm tra quyền
     * @return DTO của thông báo sau khi cập nhật
     */
    @Transactional
    public NotificationDto markAsRead(Long notificationId, Long currentUserId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo với ID: " + notificationId));

        // Kiểm tra quyền - người dùng chỉ được đánh dấu thông báo của chính họ
        if (!notification.getUser().getId().equals(currentUserId)) {
            throw new RuntimeException("Bạn không có quyền đánh dấu thông báo này");
        }

        notification.setRead(true);
        notification = notificationRepository.save(notification);

        return convertToDto(notification);
    }

    /**
     * Đánh dấu tất cả thông báo của một user là đã đọc
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);

        unreadNotifications.forEach(notification -> notification.setRead(true));

        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Cập nhật trạng thái gửi WebSocket thành công
     */
    @Transactional
    public void markAsSentViaWebsocket(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo với ID: " + notificationId));

        notification.setSentViaWebsocket(true);
        notificationRepository.save(notification);
    }

    /**
     * Tăng số lần retry gửi WebSocket
     */
    @Transactional
    public void incrementRetryCount(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo với ID: " + notificationId));

        notification.setRetryCount(notification.getRetryCount() + 1);
        notificationRepository.save(notification);
    }

    /**
     * Lấy các thông báo chưa gửi qua WebSocket cho một user
     * @param userId ID của người dùng (không được phép null)
     * @return Danh sách thông báo chưa gửi
     */
    public List<NotificationDto> getPendingNotificationsForUser(Long userId) {
        if (userId == null) {
            throw new RuntimeException("userId không được phép là null");
        }

        List<Notification> notifications = notificationRepository.findPendingNotificationsForUser(userId);
        return notifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả các thông báo chưa gửi qua WebSocket trong hệ thống
     * CHỈ dành cho quản trị viên hoặc background jobs
     * @param maxRetries Số lần thử tối đa
     * @return Danh sách tất cả thông báo chưa gửi
     */
    public List<NotificationDto> getAllPendingNotifications(int maxRetries) {
        List<Notification> notifications = notificationRepository.findAllPendingNotificationsWithRetryLessThan(maxRetries);
        return notifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private NotificationDto convertToDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .entityId(notification.getEntityId())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

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
        return createAndSendNotification(teacherId, title, message, NotificationType.COURSE_CREATED, courseId);
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
        return createAndSendNotification(teacherId, title, message, NotificationType.COURSE_UPDATED, courseId);
    }

    /**
     * Gửi thông báo khi khóa học bị xóa
     * @param teacherId ID của giảng viên
     * @param courseName Tên khóa học
     */
    @Transactional
    public NotificationDto notifyCourseDeleted(Long teacherId, String courseName) {
        String title = "Khóa học đã bị xóa";
        String message = "Khóa học \"" + courseName + "\" đã b�� xóa.";
        return createAndSendNotification(teacherId, title, message, NotificationType.COURSE_DELETED, null);
    }

    /**
     * Gửi thông báo khi có học viên mới tham gia khóa học
     * @param teacherId ID của gi���ng viên
     * @param courseId ID của khóa học
     * @param courseName Tên khóa học
     * @param studentName Tên học viên
     */
    @Transactional
    public NotificationDto notifyStudentEnrolled(Long teacherId, Long courseId, String courseName, String studentName) {
        String title = "Học viên mới tham gia khóa học";
        String message = "Học viên \"" + studentName + "\" đã tham gia vào khóa học \"" + courseName + "\".";
        return createAndSendNotification(teacherId, title, message, NotificationType.STUDENT_ENROLLED, courseId);
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
        return createAndSendNotification(teacherId, title, message, NotificationType.COURSE_FEEDBACK, courseId);
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
        return createAndSendNotification(teacherId, title, message, NotificationType.LESSON_CREATED, lessonId);
    }

    /**
     * Gửi thông báo khi bài tập mới đư���c giao
     * @param teacherId ID của giảng viên
     * @param assignmentId ID của bài tập
     * @param assignmentName Tên bài tập
     * @param courseName Tên khóa học
     */
    @Transactional
    public NotificationDto notifyAssignmentCreated(Long teacherId, Long assignmentId, String assignmentName, String courseName) {
        String title = "Bài tập mới được giao";
        String message = "Bài tập \"" + assignmentName + "\" đã được giao cho khóa học \"" + courseName + "\".";
        return createAndSendNotification(teacherId, title, message, NotificationType.ASSIGNMENT_CREATED, assignmentId);
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
        return createAndSendNotification(teacherId, title, message, NotificationType.ASSIGNMENT_UPDATED, assignmentId);
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
        return createAndSendNotification(teacherId, title, message, NotificationType.ASSIGNMENT_SUBMITTED, assignmentId);
    }

    /**
     * Gửi thông báo khi bài tập được chấm điểm
     * @param studentId ID của học viên
     * @param assignmentId ID của bài tập
     * @param assignmentName Tên bài tập
     * @param grade Điểm số
     */
    @Transactional
    public NotificationDto notifyAssignmentGraded(Long studentId, Long assignmentId, String assignmentName, Double grade) {
        String title = "Bài tập đã được chấm điểm";
        String message = "Bài tập \"" + assignmentName + "\" đã được chấm điểm: " + grade;
        return createAndSendNotification(studentId, title, message, NotificationType.ASSIGNMENT_GRADED, assignmentId);
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
        return createAndSendNotification(teacherId, title, message, NotificationType.EXAM_CREATED, examId);
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
        return createAndSendNotification(teacherId, title, message, NotificationType.EXAM_UPDATED, examId);
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
        return createAndSendNotification(teacherId, title, message, NotificationType.EXAM_DELETED, null);
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
                          examName + "\" với số đi��m: " + score;
        return createAndSendNotification(teacherId, title, message, NotificationType.EXAM_RESULT, examId);
    }
}
