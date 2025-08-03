package com.Courses.Courses.enums;

public enum Message {
    SUCCESS("Thành công"),
    ERROR("Lỗi hệ thống"),
    NOT_FOUND("Không tìm thấy"),
    INVALID_INPUT("Dữ liệu không hợp lệ"),
    UNAUTHORIZED("Không có quyền truy cập"),
    FORBIDDEN("Bị từ chối truy cập"),
    CREATED("Tạo mới thành công"),
    UPDATED("Cập nhật thành công"),
    DELETED("Xóa thành công"),
    SERVER_ERROR("Lỗi máy chủ"),
    BAD_REQUEST("Yêu cầu không hợp lệ");

    private final String message;

    Message(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
