package com.Courses.Courses.service.kafka;

import com.Courses.Courses.model.dto.MonitoringEventDto;
import com.Courses.Courses.service.ExamMonitoringService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Kafka Consumer để xử lý các sự kiện giám sát từ bài kiểm tra
 */
@Component
public class ExamMonitoringConsumer {
    private static final Logger log = LoggerFactory.getLogger(ExamMonitoringConsumer.class);

    private final ExamMonitoringService examMonitoringService;

    @Autowired
    public ExamMonitoringConsumer(ExamMonitoringService examMonitoringService) {
        this.examMonitoringService = examMonitoringService;
    }

    /**
     * Xử lý các sự kiện giám sát gian lận từ bài kiểm tra
     */
    @KafkaListener(topics = "exam-monitoring", groupId = "exam_monitoring_group",
            autoStartup = "true", concurrency = "1")
    public void handleMonitoringEvents(MonitoringEventDto eventDto) {
        try {
            log.info("Nhận sự kiện từ Kafka: {} - Học sinh: {} - Bài kiểm tra: {}",
                    eventDto.getEventType(), eventDto.getStudentId(), eventDto.getExamId());

            // Xử lý sự kiện giám sát
            examMonitoringService.processMonitoringEvent(eventDto);

        } catch (Exception e) {
            log.error("Lỗi khi xử lý sự kiện giám sát từ Kafka: {}. Chi tiết: {}",
                    e.getMessage(), e.getStackTrace()[0], e);
        }
    }

    /**
     * Xử lý các cảnh báo về gian lận
     */
    @KafkaListener(topics = "exam-alerts", groupId = "exam_alerts_group",
            autoStartup = "true", concurrency = "1")
    public void handleExamAlerts(Map<String, Object> alert) {
        try {
            log.warn("CẢNH BÁO GIAN LẬN từ Kafka: {} - Học sinh: {} - Bài kiểm tra: {}",
                    alert.get("alertMessage"), alert.get("studentName"), alert.get("examTitle"));

            // Tại đây có thể thực hiện thêm các hành động như:
            // 1. Gửi thông báo cho giáo viên qua WebSocket
            // 2. Gửi email cảnh báo
            // 3. Lưu log chi tiết vào hệ thống
        } catch (Exception e) {
            log.error("Lỗi khi xử lý cảnh báo gian lận từ Kafka: {}. Chi tiết: {}",
                    e.getMessage(), e.getStackTrace()[0], e);
        }
    }
}
