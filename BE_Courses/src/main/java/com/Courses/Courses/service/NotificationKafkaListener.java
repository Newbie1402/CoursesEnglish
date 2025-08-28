package com.Courses.Courses.service;

import com.Courses.Courses.model.dto.NotificationDto;
import com.Courses.Courses.model.event.NotificationEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class NotificationKafkaListener {
    private static final Logger log = LoggerFactory.getLogger(NotificationKafkaListener.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private NotificationService notificationService;

    /**
     * Lắng nghe các thông báo từ Kafka và gửi qua WebSocket
     */
    @KafkaListener(topics = "user-notifications", groupId = "notification_group")
    public void consumeNotification(NotificationEvent event) {
        try {
            log.info("Nhận thông báo từ Kafka cho userId: {}, title: {}", event.getUserId(), event.getTitle());

            // Tạo NotificationDto
            NotificationDto notificationDto = NotificationDto.builder()
                    .title(event.getTitle())
                    .message(event.getMessage())
                    .type(event.getType())
                    .entityId(event.getEntityId())
                    .read(false)
                    .createdAt(java.time.LocalDateTime.now())
                    .build();

            // Gửi thông báo qua WebSocket
            String destination = "/topic/notifications." + event.getUserId();
            messagingTemplate.convertAndSend(destination, notificationDto);

            log.info("Đã gửi thông báo qua WebSocket đến: {}", destination);

        } catch (Exception e) {
            log.error("Lỗi khi xử lý thông báo từ Kafka: {}", e.getMessage(), e);
        }
    }
}
