package com.Courses.Courses.enums;

/**
 * Enum định nghĩa các loại thông báo trong hệ thống
 */
public enum NotificationType {
    // Thông báo chung
    GENERAL("GENERAL", "Thông báo chung"),

    // Thông báo liên quan đến khóa học cho giảng viên
    COURSE_CREATED("COURSE_CREATED", "Khóa học mới được tạo"),
    COURSE_UPDATED("COURSE_UPDATED", "Khóa học được cập nhật"),
    COURSE_DELETED("COURSE_DELETED", "Khóa học đã bị xóa"),
    STUDENT_ENROLLED("STUDENT_ENROLLED", "Học viên mới tham gia khóa học"),
    COURSE_FEEDBACK("COURSE_FEEDBACK", "Phản hồi mới về khóa học"),

    // Thông báo liên quan đến bài học và bài tập cho giảng viên
    LESSON_CREATED("LESSON_CREATED", "Bài học mới được thêm vào khóa học"),
    ASSIGNMENT_CREATED("ASSIGNMENT_CREATED", "Bài tập mới được giao"),
    ASSIGNMENT_UPDATED("ASSIGNMENT_UPDATED", "Bài tập được cập nhật"),
    ASSIGNMENT_SUBMITTED("ASSIGNMENT_SUBMITTED", "Bài tập đã được nộp"),
    ASSIGNMENT_GRADED("ASSIGNMENT_GRADED", "Bài tập đã được chấm điểm"),

    // Thông báo liên quan đến bài kiểm tra cho giảng viên
    EXAM_CREATED("EXAM_CREATED", "Bài kiểm tra mới được tạo"),
    EXAM_UPDATED("EXAM_UPDATED", "Bài kiểm tra được cập nhật"),
    EXAM_DELETED("EXAM_DELETED", "Bài kiểm tra đã bị xóa"),
    EXAM_RESULT("EXAM_RESULT", "Kết quả bài kiểm tra"),

    // Thông báo liên quan đến khóa học cho học viên
    STUDENT_COURSE_UPDATED("STUDENT_COURSE_UPDATED", "Khóa học bạn tham gia đã được cập nhật"),
    STUDENT_COURSE_DELETED("STUDENT_COURSE_DELETED", "Khóa học bạn tham gia đã bị xóa"),
    STUDENT_COURSE_ANNOUNCEMENT("STUDENT_COURSE_ANNOUNCEMENT", "Thông báo mới từ giảng viên về khóa học"),

    // Thông báo liên quan đến bài học cho học viên
    STUDENT_LESSON_ADDED("STUDENT_LESSON_ADDED", "Bài học mới được thêm vào khóa học bạn tham gia"),

    // Thông báo liên quan đến bài kiểm tra cho học viên
    STUDENT_EXAM_CREATED("STUDENT_EXAM_CREATED", "Bài kiểm tra mới trong khóa học bạn tham gia"),
    STUDENT_EXAM_UPDATED("STUDENT_EXAM_UPDATED", "Bài kiểm tra trong khóa học bạn tham gia đã được cập nhật"),
    STUDENT_EXAM_DELETED("STUDENT_EXAM_DELETED", "Bài kiểm tra trong khóa học bạn tham gia đã bị xóa"),
    STUDENT_EXAM_RESULT("STUDENT_EXAM_RESULT", "Kết quả bài kiểm tra của bạn đã có");

    private final String code;
    private final String description;

    NotificationType(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}
