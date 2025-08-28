package com.Courses.Courses.controller;

import com.Courses.Courses.model.dto.NotificationDto;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.enums.StatusApplication;
import com.Courses.Courses.security.jwt.JWTUtil;
import com.Courses.Courses.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
public class NotificationController {
    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private JWTUtil jwtUtil;

    /**
     * Lấy danh sách thông báo của người dùng hiện tại
     */
    @GetMapping
    public ResponseEntity<ResponseData<Page<NotificationDto>>> getMyNotifications(
            @RequestHeader("Authorization") String authHeader,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            String token = authHeader.substring(7);
            Long userId = extractUserIdFromToken(token);

            Page<NotificationDto> notifications = notificationService.getUserNotifications(userId, pageable);

            return ResponseEntity.ok(
                new ResponseData<>(
                    StatusApplication.SUCCESS.getCode(),
                    "Lấy danh sách thông báo thành công",
                    notifications
                )
            );
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách thông báo: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                new ResponseData<>(
                    StatusApplication.ERROR.getCode(),
                    "Lỗi khi lấy danh sách thông báo: " + e.getMessage(),
                    null
                )
            );
        }
    }

    /**
     * Lấy số lượng thông báo chưa đọc
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ResponseData<Map<String, Long>>> getUnreadCount(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long userId = extractUserIdFromToken(token);

            long count = notificationService.countUnreadNotifications(userId);

            Map<String, Long> response = new HashMap<>();
            response.put("count", count);

            return ResponseEntity.ok(
                new ResponseData<>(
                    StatusApplication.SUCCESS.getCode(),
                    "Lấy số thông báo chưa đọc thành công",
                    response
                )
            );
        } catch (Exception e) {
            log.error("Lỗi khi lấy số thông báo chưa đọc: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                new ResponseData<>(
                    StatusApplication.ERROR.getCode(),
                    "Lỗi khi lấy số thông báo chưa đọc: " + e.getMessage(),
                    null
                )
            );
        }
    }

    /**
     * Đánh dấu một thông báo là đã đọc
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ResponseData<NotificationDto>> markAsRead(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        try {
            String token = authHeader.substring(7);
            Long userId = extractUserIdFromToken(token);

            NotificationDto notification = notificationService.markAsRead(id, userId);

            return ResponseEntity.ok(
                new ResponseData<>(
                    StatusApplication.SUCCESS.getCode(),
                    "Đánh dấu thông báo đã đọc thành công",
                    notification
                )
            );
        } catch (Exception e) {
            log.error("Lỗi khi đánh dấu thông báo đã đọc: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                new ResponseData<>(
                    StatusApplication.ERROR.getCode(),
                    "Lỗi khi đánh dấu thông báo đã đọc: " + e.getMessage(),
                    null
                )
            );
        }
    }

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    @PutMapping("/read-all")
    public ResponseEntity<ResponseData<Void>> markAllAsRead(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long userId = extractUserIdFromToken(token);

            notificationService.markAllAsRead(userId);

            return ResponseEntity.ok(
                new ResponseData<>(
                    StatusApplication.SUCCESS.getCode(),
                    "Đánh dấu tất cả thông báo đã đọc thành công",
                    null
                )
            );
        } catch (Exception e) {
            log.error("Lỗi khi đánh dấu tất cả thông báo đã đọc: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                new ResponseData<>(
                    StatusApplication.ERROR.getCode(),
                    "Lỗi khi đánh dấu tất cả thông báo đã đọc: " + e.getMessage(),
                    null
                )
            );
        }
    }

    private Long extractUserIdFromToken(String token) {
        Object userId = jwtUtil.extractClaim(token, claims -> claims.get("UserId"));
        if (userId == null) {
            throw new RuntimeException("Không thể trích xuất userId từ token");
        }

        if (userId instanceof Integer) {
            return ((Integer) userId).longValue();
        } else if (userId instanceof Long) {
            return (Long) userId;
        } else {
            return Long.parseLong(userId.toString());
        }
    }
}
