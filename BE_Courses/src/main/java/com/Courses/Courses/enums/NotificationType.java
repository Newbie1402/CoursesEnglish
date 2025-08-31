package com.Courses.Courses.enums;


public enum NotificationType {
    // Thông báo chung
    GENERAL("GENERAL", "Thông báo chung"),

    // Thông báo liên quan đến khóa học
    COURSE_CREATED("COURSE_CREATED", "Khóa học mới được tạo"),
    COURSE_UPDATED("COURSE_UPDATED", "Khóa học được cập nhật"),
    COURSE_DELETED("COURSE_DELETED", "Khóa học đã bị xóa"),
    STUDENT_ENROLLED("STUDENT_ENROLLED", "Học viên mới tham gia khóa học"),
    COURSE_FEEDBACK("COURSE_FEEDBACK", "Phản hồi mới về khóa học"),

    // Thông báo liên quan đến bài học và bài tập
    LESSON_CREATED("LESSON_CREATED", "Bài học mới được thêm vào khóa học"),
    ASSIGNMENT_CREATED("ASSIGNMENT_CREATED", "Bài tập mới được giao"),
    ASSIGNMENT_UPDATED("ASSIGNMENT_UPDATED", "Bài tập được cập nhật"),
    ASSIGNMENT_SUBMITTED("ASSIGNMENT_SUBMITTED", "Bài tập đã được nộp"),
    ASSIGNMENT_GRADED("ASSIGNMENT_GRADED", "Bài tập đã được chấm điểm"),

    // Thông báo liên quan đến bài kiểm tra
    EXAM_CREATED("EXAM_CREATED", "Bài kiểm tra mới được tạo"),
    EXAM_UPDATED("EXAM_UPDATED", "Bài kiểm tra được cập nhật"),
    EXAM_DELETED("EXAM_DELETED", "Bài kiểm tra đã bị xóa"),
    EXAM_RESULT("EXAM_RESULT", "Kết quả bài kiểm tra");

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
