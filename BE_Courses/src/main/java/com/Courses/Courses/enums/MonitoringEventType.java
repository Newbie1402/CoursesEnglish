package com.Courses.Courses.enums;


public enum MonitoringEventType {
    WINDOW_BLUR,            // Học sinh chuyển ra khỏi tab làm bài
    WINDOW_FOCUS,           // Học sinh quay lại tab làm bài
    COPY_DETECTED,          // Phát hiện sao chép nội dung
    PASTE_DETECTED,         // Phát hiện dán nội dung
    SCREENSHOT_DETECTED,    // Phát hiện chụp màn hình
    MULTIPLE_WINDOWS,       // Phát hiện nhiều cửa sổ mở
    FACE_NOT_VISIBLE,       // Không thấy khuôn mặt học sinh (nếu có camera)
    MULTIPLE_FACES,         // Phát hiện nhiều khuôn mặt (nếu có camera)
    PROHIBITED_SITE_ACCESS, // Truy cập trang web bị cấm
    NETWORK_DISCONNECTION,  // Mất kết nối mạng
    CUSTOM_EVENT            // Sự kiện tùy chỉnh khác
}
