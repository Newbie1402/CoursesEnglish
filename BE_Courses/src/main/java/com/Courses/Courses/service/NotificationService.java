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
     * Tạo và lưu thông báo mới với enum NotificationType
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
}
