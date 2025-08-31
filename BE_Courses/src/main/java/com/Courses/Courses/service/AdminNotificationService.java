package com.Courses.Courses.service;

import com.Courses.Courses.enums.NotificationType;
import com.Courses.Courses.enums.Role;
import com.Courses.Courses.model.dto.NotificationDto;
import com.Courses.Courses.model.entity.Users;
import com.Courses.Courses.repository.UsersRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminNotificationService {
    private static final Logger log = LoggerFactory.getLogger(AdminNotificationService.class);

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UsersRepository usersRepository;

    /**
     * Lấy danh sách ID của tất cả quản trị viên
     * @return Danh sách ID của quản trị viên
     */
    private List<Long> findAllAdminIds() {
        return usersRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(Role.ADMIN))
                .map(Users::getId)
                .collect(Collectors.toList());
    }

    /**
     * Gửi thông báo đến tất cả quản trị viên
     * @param title Tiêu đề thông báo
     * @param message Nội dung thông báo
     * @param type Loại thông báo
     * @param entityId ID của đối tượng liên quan (nếu có)
     */
    @Transactional
    public void notifyAllAdmins(String title, String message, NotificationType type, Long entityId) {
        // Lấy danh sách ID của tất cả quản trị viên
        List<Long> adminIds = findAllAdminIds();

        // Gửi thông báo đến từng quản trị viên
        for (Long adminId : adminIds) {
            notificationService.createAndSendNotification(
                adminId, title, message, type, entityId
            );
        }

        log.info("Đã gửi thông báo '{}' đến {} quản trị viên", title, adminIds.size());
    }

    //QUẢN LÝ NGƯỜI DÙNG

    /**
     * Thông báo đến quản trị viên khi có tài khoản mới được xác thực
     * @param userId ID của tài khoản mới
     * @param email Email của tài khoản
     * @param userFullName Tên đầy đủ của người dùng
     */
    @Transactional
    public void notifyNewAccountVerified(Long userId, String email, String userFullName) {
        String title = "Tài khoản mới được xác thực";
        String message = "Tài khoản của người dùng " + userFullName + " (" + email + ") đã được xác thực thành công.";

        notifyAllAdmins(title, message, NotificationType.ADMIN_NEW_ACCOUNT, userId);
    }

    /**
     * Thông báo đến quản trị viên khi tài khoản bị khóa
     * @param userId ID của tài khoản bị khóa
     * @param email Email của tài khoản
     * @param userFullName Tên đầy đủ của người dùng
     * @param reason Lý do khóa tài khoản
     * @param lockedByUsername Tên của người khóa tài khoản
     */
    @Transactional
    public void notifyAccountLocked(Long userId, String email, String userFullName,
                                  String reason, String lockedByUsername) {
        String title = "Tài khoản bị khóa";
        String message = "Tài khoản của người dùng " + userFullName + " (" + email + ") đã bị khóa bởi " +
                        lockedByUsername + ".\nLý do: " + reason;

        notifyAllAdmins(title, message, NotificationType.ADMIN_ACCOUNT_LOCKED, userId);
    }

    /**
     * Thông báo đến quản trị viên khi tài khoản được mở khóa
     * @param userId ID của tài khoản được mở khóa
     * @param email Email của tài khoản
     * @param userFullName Tên đầy đủ của người dùng
     * @param unlockedByUsername Tên của người mở khóa tài khoản
     */
    @Transactional
    public void notifyAccountUnlocked(Long userId, String email, String userFullName, String unlockedByUsername) {
        String title = "Tài khoản được mở khóa";
        String message = "Tài khoản của người dùng " + userFullName + " (" + email + ") đã được mở khóa bởi " +
                        unlockedByUsername + ".";

        notifyAllAdmins(title, message, NotificationType.ADMIN_ACCOUNT_UNLOCKED, userId);
    }

    //QUẢN LÝ KHÓA HỌC

    /**
     * Thông báo đến quản trị viên khi có khóa học mới được tạo
     * @param courseId ID của khóa học mới
     * @param courseName Tên khóa học
     * @param createdByName Tên người tạo khóa học
     */
    @Transactional
    public void notifyCourseCreated(Long courseId, String courseName, String createdByName) {
        String title = "Khóa học mới được tạo";
        String message = "Khóa học \"" + courseName + "\" đã được tạo bởi " + createdByName + ".";

        notifyAllAdmins(title, message, NotificationType.ADMIN_COURSE_CREATED, courseId);
    }

    /**
     * Thông báo đến quản trị viên khi khóa học được cập nhật
     * @param courseId ID của khóa học
     * @param courseName Tên khóa học
     * @param updatedByName Tên người cập nhật khóa học
     * @param changes Các thay đổi chính (tùy chọn)
     */
    @Transactional
    public void notifyCourseUpdated(Long courseId, String courseName, String updatedByName, String changes) {
        String title = "Khóa học được cập nhật";
        String message = "Khóa học \"" + courseName + "\" đã được cập nhật bởi " + updatedByName + ".";
        if (changes != null && !changes.isEmpty()) {
            message += "\nCác thay đổi chính: " + changes;
        }

        notifyAllAdmins(title, message, NotificationType.ADMIN_COURSE_UPDATED, courseId);
    }

    /**
     * Thông báo đến quản trị viên khi khóa học bị xóa
     * @param courseName Tên khóa học
     * @param deletedByName Tên người xóa khóa học
     * @param reason Lý do xóa (tùy chọn)
     */
    @Transactional
    public void notifyCourseDeleted(String courseName, String deletedByName, String reason) {
        String title = "Khóa học bị xóa";
        String message = "Khóa học \"" + courseName + "\" đã bị xóa bởi " + deletedByName + ".";
        if (reason != null && !reason.isEmpty()) {
            message += "\nLý do: " + reason;
        }

        notifyAllAdmins(title, message, NotificationType.ADMIN_COURSE_DELETED, null);
    }

    //QUẢN LÝ BÀI KIỂM TRA

    /**
     * Thông báo đến quản trị viên khi có bài kiểm tra mới được tạo
     * @param examId ID của bài kiểm tra mới
     * @param examName Tên bài kiểm tra
     * @param courseName Tên khóa học
     * @param createdByName Tên người tạo bài kiểm tra
     */
    @Transactional
    public void notifyExamCreated(Long examId, String examName, String courseName, String createdByName) {
        String title = "Bài kiểm tra mới được tạo";
        String message = "Bài kiểm tra \"" + examName + "\" thuộc khóa học \"" + courseName +
                       "\" đã được tạo bởi " + createdByName + ".";

        notifyAllAdmins(title, message, NotificationType.ADMIN_EXAM_CREATED, examId);
    }

    /**
     * Thông báo đến quản trị viên khi bài kiểm tra được cập nhật
     * @param examId ID của bài kiểm tra
     * @param examName Tên bài kiểm tra
     * @param courseName Tên khóa học
     * @param updatedByName Tên người cập nhật bài kiểm tra
     * @param changes Các thay đổi chính (tùy chọn)
     */
    @Transactional
    public void notifyExamUpdated(Long examId, String examName, String courseName,
                                String updatedByName, String changes) {
        String title = "Bài kiểm tra được cập nhật";
        String message = "Bài kiểm tra \"" + examName + "\" thuộc khóa học \"" + courseName +
                       "\" đã được cập nhật bởi " + updatedByName + ".";
        if (changes != null && !changes.isEmpty()) {
            message += "\nCác thay đổi chính: " + changes;
        }

        notifyAllAdmins(title, message, NotificationType.ADMIN_EXAM_UPDATED, examId);
    }

    /**
     * Thông báo đến quản trị viên khi bài kiểm tra bị xóa
     * @param examName Tên bài kiểm tra
     * @param courseName Tên khóa học
     * @param deletedByName Tên người xóa bài kiểm tra
     * @param reason Lý do xóa (tùy chọn)
     */
    @Transactional
    public void notifyExamDeleted(String examName, String courseName, String deletedByName, String reason) {
        String title = "Bài kiểm tra bị xóa";
        String message = "Bài kiểm tra \"" + examName + "\" thuộc khóa học \"" + courseName +
                       "\" đã bị xóa bởi " + deletedByName + ".";
        if (reason != null && !reason.isEmpty()) {
            message += "\nLý do: " + reason;
        }

        notifyAllAdmins(title, message, NotificationType.ADMIN_EXAM_DELETED, null);
    }
}
