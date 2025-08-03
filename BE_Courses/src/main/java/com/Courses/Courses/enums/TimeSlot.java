package com.Courses.Courses.enums;

public enum TimeSlot {
    SLOT_1("06:45 - 09:15"),
    SLOT_2("09:25 - 11:55"),
    SLOT_3("12:10 - 13:00"),
    SLOT_4("14:50 - 17:20"),
    SLOT_5("17:30 - 20:00"),
    SLOT_6("20:10 - 21:50");
    private final String timeRange;

    TimeSlot(String timeRange) {
        this.timeRange = timeRange;
    }

    public String getTimeRange() {
        return timeRange;
    }
}
