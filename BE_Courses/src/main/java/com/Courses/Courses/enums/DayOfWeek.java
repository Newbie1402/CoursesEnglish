package com.Courses.Courses.enums;

public enum DayOfWeek {
    MONDAY,    // Thứ Hai
    TUESDAY,   // Thứ Ba
    WEDNESDAY, // Thứ Tư
    THURSDAY,  // Thứ Năm
    FRIDAY,    // Thứ Sáu
    SATURDAY,  // Thứ Bảy
    SUNDAY;     // Chủ Nhật

    public String toUpperCase() {
        return name().toUpperCase();
    }
}
