package com.Courses.Courses.service;

import com.Courses.Courses.model.dto.NotificationDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class NotificationScheduler {
    private static final Logger log = LoggerFactory.getLogger(NotificationScheduler.class);
    private static final int MAX_RETRY_COUNT = 3;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Xử lý các thông báo chưa gửi được qua WebSocket mỗi 5 phút
     * Xử lý khi người dùng đăng nhập sau khi offline
     */
    @Scheduled(fixedRate = 300000) // 5 phút
    public void processPendingNotifications() {
        try {
            log.info("Bắt đầu xử lý các thông báo chưa gửi...");

            // Lấy tất cả thông báo chưa gửi có số lần thử < 3
            List<NotificationDto> pendingNotifications = notificationService.getAllPendingNotifications(MAX_RETRY_COUNT);

            for (NotificationDto notification : pendingNotifications) {
                try {
                    // Gửi qua WebSocket
                    String destination = "/topic/notifications." + notification.getUserId();
                    messagingTemplate.convertAndSend(destination, notification);

                    // Đánh dấu đã gửi
                    notificationService.markAsSentViaWebsocket(notification.getId());

                    log.info("Đã gửi lại thông báo ID {} cho userId {}",
                             notification.getId(), notification.getUserId());

                } catch (Exception e) {
                    // Tăng số lần thử
                    notificationService.incrementRetryCount(notification.getId());
                    log.error("Lỗi khi gửi lại thông báo ID {}: {}", notification.getId(), e.getMessage());
                }
            }

            log.info("Hoàn thành xử lý {} thông báo chưa gửi", pendingNotifications.size());

        } catch (Exception e) {
            log.error("Lỗi khi xử lý các thông báo chưa gửi: {}", e.getMessage(), e);
        }
    }
}
